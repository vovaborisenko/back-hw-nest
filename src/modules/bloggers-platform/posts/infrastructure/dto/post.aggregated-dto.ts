import { PostDocument } from '../../domain/post.entity';
import { BlogDocument } from '../../../blogs/domain/blog.entity';

export type AggregatedPostDto = Omit<PostDocument, 'blog'> & {
  blog: BlogDocument;
};
