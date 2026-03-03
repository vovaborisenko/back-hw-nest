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
  ValidationPipe,
} from '@nestjs/common';
import { BasePaginatedViewDto } from '../../../../core/api/view-dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { GetPostsQueryParamsInputDto } from './input-dto/get-posts.query-params.input-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  getAll(
    @Query(new ValidationPipe({ transform: true }))
    query: GetPostsQueryParamsInputDto,
  ): Promise<BasePaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputDto): Promise<PostViewDto> {
    const id = await this.postService.createPost(dto);

    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostInputDto,
  ): Promise<void> {
    await this.postService.updatePost(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postService.deletePost(id);
  }
}
