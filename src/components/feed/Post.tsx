import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import React, { Suspense } from 'react'
import Comments from './Comments';
import { Post as PostType, User } from "@prisma/client";
import PostInfo from './PostInfo';
import PostInteraction from './PostInteraction';

type FeedPostType = PostType        // FeedPostType = post  
  & { user: User }                  // + user
  & { likes: [{ userId: string }] } // + like=[{userId}]  Lista de usuario que dieron like a la publicación
  & {_count: { comments: number };  // + nº de comentarios
};

const Post = ({ post }: { post: FeedPostType }) => {

  const { userId } = auth();

  return (
    <div className="flex flex-col gap-4">

      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={post.user.avatar || "/noAvatar.png"}
            width={40}
            height={40}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium">
            {
              post.user.name && post.user.surname
                ? post.user.name + " " + post.user.surname
                : post.user.username
            }
          </span>
        </div>
        {userId === post.user.id && <PostInfo postId={post.id} />}
      </div>

      {/* DESC */}
      <div className="flex flex-col gap-4">
        {post.img && (
          <div className="w-full min-h-96 relative">
            <Image
              src={post.img}
              fill
              className="object-cover rounded-md"
              alt=""
              />
          </div>
        )}
        <p>
          {post.desc}
        </p>
      </div>

      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}                                // Id del post
          likes={post.likes.map((like) => like.userId)}   // [likes] lista de userId que dieron like
          commentNumber={post._count.comments}            // Nº de comentarios del post
        />
      </Suspense>

      <Suspense fallback="Loading...">                    
        <Comments 
          postId={post.id}                                 // Id del post 
        />                     
      </Suspense>

    </div>
  )
}

export default Post