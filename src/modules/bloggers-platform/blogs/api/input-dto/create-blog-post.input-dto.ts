import { CreateBlogPostDto } from '../../dto/create-blog-post.dto';

export class CreateBlogPostInputDto implements CreateBlogPostDto {
  title: string;
  shortDescription: string;
  content: string;
}
