import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { IsOptional, Matches } from 'class-validator';
import { IsStringLengthTrim } from '../../../../../core/decorators/validation/is-string-length-trim';
import { URL_REG_EXP } from '../../../../../core/constants/reg-exp';

export class UpdateBlogInputDto implements UpdateBlogDto {
  @IsStringLengthTrim()
  @IsOptional()
  name?: string;

  @IsStringLengthTrim()
  @IsOptional()
  description?: string;

  @Matches(URL_REG_EXP)
  @IsStringLengthTrim()
  @IsOptional()
  websiteUrl?: string;
}
