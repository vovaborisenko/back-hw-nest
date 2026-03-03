import { CreatePostDto } from '../../dto/create-post.dto';

export class CreatePostInputDto implements CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
