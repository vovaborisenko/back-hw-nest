import { CreateBlogPostDto } from '../../dto/create-blog-post.dto';
import { IsStringLengthTrim } from '../../../../../core/decorators/validation/is-string-length-trim';

export class CreateBlogPostInputDto implements CreateBlogPostDto {
  @IsStringLengthTrim()
  title: string;

  @IsStringLengthTrim()
  shortDescription: string;

  @IsStringLengthTrim()
  content: string;
}
