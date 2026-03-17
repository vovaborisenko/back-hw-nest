import { Aggregate, QueryFilter, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../domain/comment.entity';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';
import { BasePaginatedViewDto } from '../../../../core/api/view-dto/base.paginated.view-dto';
import { GetCommentsQueryParamsInputDto } from '../api/input-dto/get-comments.query-params.input-dto';
import { AggregatedCommentDto } from './dto/comment.aggregated-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {}
  async findMany(
    query: GetCommentsQueryParamsInputDto,
    postId?: string | Types.ObjectId,
  ): Promise<BasePaginatedViewDto<CommentViewDto[]>> {
    const skip = query.skip;
    const sort = {
      [query.sortBy]: query.sortDirection,
      _id: query.sortDirection,
    };

    const filter: QueryFilter<CommentDocument> = { deletedAt: null };

    if (postId) {
      filter.post = new Types.ObjectId(postId);
    }

    const [items, totalCount] = await Promise.all([
      this.getAggregatedComments(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.pageSize),
      this.CommentModel.countDocuments(filter),
    ]);

    return BasePaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items: items.map((item) => CommentViewDto.mapToView(item)),
    });
  }

  async findById(
    id: string | Types.ObjectId,
    authorId?: string | Types.ObjectId,
  ) {
    const filter: QueryFilter<CommentDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };

    if (authorId) {
      filter.author = authorId;
    }

    const [comment] = await this.getAggregatedComments(filter);

    return comment ? CommentViewDto.mapToView(comment) : null;
  }

  async findByIdOrNotFoundFail(
    id: string | Types.ObjectId,
  ): Promise<CommentViewDto> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return comment;
  }

  private getAggregatedComments(
    filter: QueryFilter<CommentDocument>,
  ): Aggregate<AggregatedCommentDto[]> {
    return this.CommentModel.aggregate<AggregatedCommentDto>()
      .match(filter)
      .lookup({
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      })
      .unwind({
        path: '$author',
        preserveNullAndEmptyArrays: true,
      })
      .addFields({
        author: {
          $cond: {
            if: { $eq: ['$author', null] },
            then: { _id: '$author' },
            else: '$author',
          },
        },
      });
  }
}
