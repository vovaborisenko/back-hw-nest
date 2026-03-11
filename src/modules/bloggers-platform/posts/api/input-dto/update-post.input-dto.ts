import { UpdatePostDto } from '../../dto/update-post.dto';
import { IsStringLengthTrim } from '../../../../../core/decorators/validation/is-string-length-trim';
import { IsOptional } from 'class-validator';

export class UpdatePostInputDto implements UpdatePostDto {
  @IsStringLengthTrim()
  @IsOptional()
  title?: string;

  @IsStringLengthTrim()
  @IsOptional()
  shortDescription?: string;

  @IsStringLengthTrim()
  @IsOptional()
  content?: string;

  @IsStringLengthTrim()
  @IsOptional()
  blogId?: string;
}
