import { IsMongoId, IsOptional } from 'class-validator';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { IsStringLengthTrim } from '../../../../../core/decorators/validation/is-string-length-trim';

export class UpdatePostInputDto implements UpdatePostDto {
  @IsStringLengthTrim(1, 30)
  @IsOptional()
  title?: string;

  @IsStringLengthTrim(1, 100)
  @IsOptional()
  shortDescription?: string;

  @IsStringLengthTrim(1, 1000)
  @IsOptional()
  content?: string;

  @IsMongoId()
  @IsOptional()
  blogId?: string;
}
