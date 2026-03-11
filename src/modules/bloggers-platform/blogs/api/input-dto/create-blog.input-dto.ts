import { CreateBlogDto } from '../../dto/create-blog.dto';
import { IsStringLengthTrim } from '../../../../../core/decorators/validation/is-string-length-trim';
import { Matches } from 'class-validator';
import { URL_REG_EXP } from '../../../../../core/constants/reg-exp';

export class CreateBlogInputDto implements CreateBlogDto {
  @IsStringLengthTrim()
  name: string;

  @IsStringLengthTrim()
  description: string;

  @Matches(URL_REG_EXP)
  @IsStringLengthTrim()
  websiteUrl: string;
}
