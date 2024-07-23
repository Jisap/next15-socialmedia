import React from 'react'
import { auth } from "@clerk/nextjs/server";
import Post from './Post'
import prisma from '@/lib/client';

const Feed = async ({ username }: { username?: string }) => {
  
  const {userId} = auth();

  let posts: any[] = [];

  if (username) {
    posts = await prisma.post.findMany({    // Post del usuario que viene por url
      where: {
        user: {
          username: username,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (!username && userId) {

    const following = await prisma.follower.findMany({ // Post seguidos por el usuario logueado
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);  // Ids de los post que sigue el usuario logueado
    const ids = [userId, ...followingIds]                      // [ids] = id del usuario logueado + sus post seguidos     

    posts = await prisma.post.findMany({  // post del usuario logueado dentro del array de ids
      where: {
        userId: {
          in: ids,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  
  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
      {posts.length ? (posts.map(post => (
        <Post 
          key={post.id} 
          post={post} 
        />
      ))) : "No posts found!"}
    </div>
  )
}

export default Feed