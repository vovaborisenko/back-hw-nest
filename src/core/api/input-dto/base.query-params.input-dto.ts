import { Type } from 'class-transformer';
import { SortDirection } from '../../constants/sort-direction';

export class BaseQueryParamsInputDto {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = 10;

  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
