import { CreatePostDto } from '../../dto/create-post.dto';
import { IsStringLengthTrim } from '../../../../../core/decorators/validation/is-string-length-trim';

export class CreatePostInputDto implements CreatePostDto {
  @IsStringLengthTrim()
  title: string;

  @IsStringLengthTrim()
  shortDescription: string;

  @IsStringLengthTrim()
  content: string;

  @IsStringLengthTrim()
  blogId: string;
}
