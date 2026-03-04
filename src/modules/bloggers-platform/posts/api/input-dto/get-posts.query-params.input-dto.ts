import { BaseQueryParamsInputDto } from '../../../../../core/api/input-dto/base.query-params.input-dto';
import { PostsSortBy } from './posts.sort-by';

export class GetPostsQueryParamsInputDto extends BaseQueryParamsInputDto {
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
}
