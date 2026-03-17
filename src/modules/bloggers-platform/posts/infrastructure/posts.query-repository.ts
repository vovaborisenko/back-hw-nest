import { Aggregate, QueryFilter, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { BasePaginatedViewDto } from '../../../../core/api/view-dto/base.paginated.view-dto';
import { GetPostsQueryParamsInputDto } from '../api/input-dto/get-posts.query-params.input-dto';
import { PostsSortBy } from '../api/input-dto/posts.sort-by';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';
import { AggregatedPostDto } from './dto/post.aggregated-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getAll(
    query: GetPostsQueryParamsInputDto,
    options?: { blogId?: string | Types.ObjectId },
  ): Promise<BasePaginatedViewDto<PostViewDto[]>> {
    const skip = query.skip;
    const sort = {
      [this.getSortBy(query.sortBy)]: query.sortDirection,
      _id: query.sortDirection,
    };
    const filter: QueryFilter<PostDocument> = { deletedAt: null };

    if (options?.blogId) {
      filter.blog = new Types.ObjectId(options.blogId);
    }

    const [items, totalCount] = await Promise.all([
      this.getAggregatedPosts(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.pageSize),
      this.PostModel.countDocuments(filter),
    ]);

    return BasePaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items: items.map((item) => PostViewDto.mapToView(item)),
    });
  }

  async findById(id: string | Types.ObjectId): Promise<PostViewDto | null> {
    const filter: QueryFilter<PostDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };

    const [post] = await this.getAggregatedPosts(filter);

    return post ? PostViewDto.mapToView(post) : null;
  }

  async getByIdOrNotFoundFail(
    id: string | Types.ObjectId,
  ): Promise<PostViewDto> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return post;
  }

  private getSortBy(querySortBy: PostsSortBy): string {
    return querySortBy === PostsSortBy.blogName ? 'blog.name' : querySortBy;
  }

  private getAggregatedPosts(
    filter: QueryFilter<PostDocument>,
  ): Aggregate<AggregatedPostDto[]> {
    return this.PostModel.aggregate<AggregatedPostDto>()
      .match(filter)
      .lookup({
        from: 'blogs',
        localField: 'blog',
        foreignField: '_id',
        as: 'blog',
      })
      .unwind({
        path: '$blog',
        preserveNullAndEmptyArrays: true,
      })
      .addFields({
        blog: {
          $cond: {
            if: { $eq: ['$blog', null] },
            then: { _id: '$blog' },
            else: '$blog',
          },
        },
      });
  }
}
