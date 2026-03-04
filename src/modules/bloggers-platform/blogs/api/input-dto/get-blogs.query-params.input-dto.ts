import { BaseQueryParamsInputDto } from '../../../../../core/api/input-dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs.sort-by';

export class GetBlogsQueryParamsInputDto extends BaseQueryParamsInputDto {
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
