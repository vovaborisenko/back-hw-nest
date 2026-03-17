import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PATH, PARAM } from '../../../../core/constants/paths';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequestDecorator } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';

const { PREFIX, SINGLE, LIKE_STATUS } = PATH.COMMENTS;

@Controller(PREFIX)
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(SINGLE)
  async getById(@Param(PARAM.ID) id: string): Promise<CommentViewDto> {
    return this.queryBus.execute(new GetCommentByIdQuery(id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(SINGLE)
  async update(
    @Param(PARAM.ID) id: string,
    @Body() dto: UpdateCommentInputDto,
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateCommentCommand(dto, id, user.id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(SINGLE)
  async remove(
    @Param(PARAM.ID) id: string,
    @ExtractUserFromRequestDecorator() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(id, user.id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(LIKE_STATUS)
  async updateLikeStatus() // @Param(PARAM.ID) id: string,
  // @Body() dto: UpdateCommentInputDto,
  // @ExtractUserFromRequestDecorator() user: UserContextDto,
  : Promise<void> {
    // await this.commandBus.execute(new UpdateLikeStatusCommand(dto, id, user.id));
  }
}
