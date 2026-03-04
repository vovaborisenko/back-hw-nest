import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findById(id).where({ deletedAt: null });
  }

  async findByIdOrNotFound(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }
}
