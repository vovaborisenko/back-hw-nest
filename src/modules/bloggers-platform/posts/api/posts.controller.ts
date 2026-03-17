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
  UseGuards,
} from '@nestjs/common';
import { BasePaginatedViewDto } from '../../../../core/api/view-dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { GetPostsQueryParamsInputDto } from './input-dto/get-posts.query-params.input-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PATH, PARAM } from '../../../../core/constants/paths';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequestDecorator } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { CreatePostCommentInputDto } from './input-dto/create-post-comment.input-dto';
import { GetCommentByIdQuery } from '../../comments/application/queries/get-comment-by-id.query';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { GetCommentsQueryParamsInputDto } from '../../comments/api/input-dto/get-comments.query-params.input-dto';
import { GetCommentsQuery } from '../../comments/application/queries/get-comments.query';

const { PREFIX, SINGLE, COMMENTS } = PATH.POSTS;

@Controller(PREFIX)
export class PostsController {
  constructor(
    private readonly postService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() dto: CreatePostInputDto): Promise<PostViewDto> {
    const id = await this.postService.createPost(dto);

    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @UseGuards(BasicAuthGuard)
  @Put(SINGLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param(PARAM.ID) id: string,
    @Body() dto: UpdatePostInputDto,
  ): Promise<void> {
    await this.postService.updatePost(id, dto);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(SINGLE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param(PARAM.ID) id: string): Promise<void> {
    await this.postService.deletePost(id);
  }

  @Get(COMMENTS)
  async getPostComments(
    @Param(PARAM.ID) postId: string,
    @Query()
    query: GetCommentsQueryParamsInputDto,
  ): Promise<BasePaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(new GetCommentsQuery(query, postId));
  }

  @UseGuards(JwtAuthGuard)
  @Post(COMMENTS)
  async createPostComment(
    @Param(PARAM.ID) postId: string,
    @Body() dto: CreatePostCommentInputDto,
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const { commentId } = await this.commandBus.execute(
      new CreateCommentCommand({
        content: dto.content,
        post: postId,
        author: user.id,
      }),
    );

    return this.queryBus.execute(new GetCommentByIdQuery(commentId));
  }
}
