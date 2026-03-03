import { PopulateOptions, QueryFilter, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { BasePaginatedViewDto } from '../../../../core/api/view-dto/base.paginated.view-dto';
import { GetPostsQueryParamsInputDto } from '../api/input-dto/get-posts.query-params.input-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  private readonly populateOptions: PopulateOptions = {
    path: 'blog',
    select: 'name',
    options: { preserveNullAndError: true },
    transform: (doc, _id) => doc ?? { _id },
  };

  private getPopulatedMyStatusOptions(
    authorId?: string | Types.ObjectId,
  ): PopulateOptions {
    return {
      path: 'myStatus',
      select: 'status',
      match: { author: authorId },
    };
  }

  async getAll(
    query: GetPostsQueryParamsInputDto,
    options?: { blogId?: string | Types.ObjectId },
  ): Promise<BasePaginatedViewDto<PostViewDto[]>> {
    const skip = query.calculateSkip();
    const sort = {
      [query.sortBy]: query.sortDirection,
      _id: query.sortDirection,
    };
    const filter: QueryFilter<PostDocument> = {};

    if (options?.blogId) {
      filter.blog = new Types.ObjectId(options.blogId);
    }

    const [items, totalCount] = await Promise.all([
      this.PostModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.pageSize)
        .populate(this.populateOptions)
        .lean(),
      this.PostModel.countDocuments(filter),
    ]);

    return BasePaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items: items.map((item) => PostViewDto.mapToView(item)),
    });
  }

  findById(id: string | Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findById(id)
      .where({
        deletedAt: null,
      })
      .populate(this.populateOptions)
      .lean();
  }

  async getByIdOrNotFoundFail(
    id: string | Types.ObjectId,
  ): Promise<PostViewDto> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post);
  }
}
