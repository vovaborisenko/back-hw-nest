import { CommentDocument } from '../../domain/comment.entity';
import { UserDocument } from '../../../../user-accounts/domain/user.entity';

export type AggregatedCommentDto = Omit<CommentDocument, 'author'> & {
  author: UserDocument;
};
