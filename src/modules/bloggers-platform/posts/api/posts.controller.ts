import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BasePaginatedViewDto } from '../../../../core/api/view-dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { GetPostsQueryParamsInputDto } from './input-dto/get-posts.query-params.input-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PATH, PARAM } from '../../../../core/constants/paths';

const { PREFIX, SINGLE } = PATH.POSTS;

@Controller(PREFIX)
export class PostsController {
  constructor(
    private readonly postService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  getAll(
    @Query()
    query: GetPostsQueryParamsInputDto,
  ): Promise<BasePaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(SINGLE)
  getById(@Param(PARAM.ID) id: string): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputDto): Promise<PostViewDto> {
    const id = await this.postService.createPost(dto);

    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Put(SINGLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param(PARAM.ID) id: string,
    @Body() dto: UpdatePostInputDto,
  ): Promise<void> {
    await this.postService.updatePost(id, dto);
  }

  @Delete(SINGLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param(PARAM.ID) id: string): Promise<void> {
    await this.postService.deletePost(id);
  }
}
