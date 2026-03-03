import { PostDocument } from '../../domain/post.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string | null;
  createdAt: string;
  extendedLikesInfo: {
    dislikesCount: number;
    likesCount: number;
    myStatus: 'None'; //post.myStatus?.status || LikeStatus.None,
    newestLikes: never[];
  };

  static mapToView(post: PostDocument) {
    const dto = new PostViewDto();

    const newestLikes = []; // post.newestLikes.map((like) => ({
    //   addedAt: like.createdAt?.toISOString(),
    //   userId: like.author?._id.toString(),
    //   login: like.author?.login,
    // }));

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blog!._id.toString();
    dto.blogName = 'name' in post.blog! ? post.blog.name : null;
    dto.createdAt = post.createdAt.toISOString();
    dto.extendedLikesInfo = {
      dislikesCount: 0, //post.dislikesCount,
      likesCount: 0, //post.likesCount,
      myStatus: 'None', //post.myStatus?.status || LikeStatus.None,
      newestLikes,
    };

    return dto;
  }
}
