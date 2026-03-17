import { AggregatedCommentDto } from '../../infrastructure/dto/comment.aggregated-dto';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: string;
  };
  createdAt: string;

  static mapToView(comment: AggregatedCommentDto) {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.author._id.toString(),
      userLogin: comment.author.login,
    };
    dto.likesInfo = {
      dislikesCount: 0,
      likesCount: 0,
      myStatus: 'None',
    };
    dto.createdAt = comment.createdAt.toISOString();

    return dto;
  }
}
