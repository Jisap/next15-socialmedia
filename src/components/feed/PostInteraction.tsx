"use client";

import { switchLike } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useOptimistic, useState } from "react";

const PostInteraction = ({
  postId,                         // id del post
  likes,                          // likes realizados por distintos usuarios
  commentNumber,                  // nº de comentarios del post
}: {
  postId: number;
  likes: string[];
  commentNumber: number;
}) => {

  const { isLoaded, userId } = useAuth();                                           // Usuario logueado

  const [likeState, setLikeState] = useState({                                      // Estado para [like] =
    likeCount: likes.length,                                                        // [{ nº de likes de distintos usuarios en la publicación 
    isLiked: userId ? likes.includes(userId) : false,                               // boolean que controla si el usuario logueado ha dado "like" (isLiked) }]
  });

  const [optimisticLike, switchOptimisticLike] = useOptimistic(                     // Estado optimitic
    likeState,                                                                      // Estado de likes
    (state, value) => {
      return {
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,       // Si el post isLiked y se pulso el boton likeCount se resta en 1, sino se suma en 1
        isLiked: !state.isLiked,                                                    // Si se pulso el boton isLiked se establece a su contrario
      };
    }
  );

  const likeAction = async () => {                                                  // Maneja la lógica para alternar el estado del "like".
    switchOptimisticLike("");                                                       // 1º  actualiza el estado de "like" optimistamente.
    try {
      switchLike(postId);                                                           // Realiza la acción de alternar "like" en el servidor.
      setLikeState((state) => ({                                                    // confirma la actualización del estado local en función del resultado de la acción.
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) { }
  };
  return (
    <div className="flex items-center justify-between text-sm my-4">
      <div className="flex gap-8">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <form action={likeAction}>
            <button>
              <Image
                src={optimisticLike.isLiked ? "/liked.png" : "/like.png"}
                width={16}
                height={16}
                alt=""
                className="cursor-pointer"
              />
            </button>
          </form>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {optimisticLike.likeCount}
            <span className="hidden md:inline"> Likes</span>
          </span>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <Image
            src="/comment.png"
            width={16}
            height={16}
            alt=""
            className="cursor-pointer"
          />
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            {commentNumber}<span className="hidden md:inline"> Comments</span>
          </span>
        </div>
      </div>
      <div className="">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <Image
            src="/share.png"
            width={16}
            height={16}
            alt=""
            className="cursor-pointer"
          />
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            <span className="hidden md:inline"> Share</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostInteraction;