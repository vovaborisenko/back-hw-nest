import { BaseQueryParamsInputDto } from '../../../../core/api/input-dto/base.query-params.input-dto';
import { UsersSortBy } from './users.sort-by';

export class GetUsersQueryParamsInputDto extends BaseQueryParamsInputDto {
  sortBy: UsersSortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
