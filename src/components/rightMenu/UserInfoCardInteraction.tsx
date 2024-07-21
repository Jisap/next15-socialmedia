"use client";

import { switchBlock, switchFollow } from "../../lib/actions";
import { useOptimistic, useState } from "react";

const UserInfoCardInteraction = ({
  userId,
  isUserBlocked,
  isFollowing,
  isFollowingSent,
}: {
  userId: string;
  isUserBlocked: boolean;
  isFollowing: boolean;
  isFollowingSent: boolean;
}) => {

  const [userState, setUserState] = useState({                              // Props que indican el estado inicial del usuario.
    following: isFollowing,
    blocked: isUserBlocked,
    followingRequestSent: isFollowingSent,
  });

  const follow = async () => {                                              // Actualiza el estado de manera optimista
    switchOptimisticState("follow");

    try {
      await switchFollow(userId);                                           // Realiza la acción en el servidor
      setUserState((prev) => ({
        ...prev,
        following: prev.following && false,
        followingRequestSent:
          !prev.following && !prev.followingRequestSent ? true : false,     // Se vuelve a actualizar el state con la misma lógica del state optimistic pero esta vez en bd
      }));
    } catch (err) { }
  };

  const block = async () => {
    switchOptimisticState("block");

    try {
      await switchBlock(userId);
      setUserState((prev) => ({
        ...prev,
        blocked: !prev.blocked,
      }));
    } catch (err) { }
  };

  const [optimisticState, switchOptimisticState] = useOptimistic(           // Se utiliza para crear interfaces que se actualizan inmediatamente en resp a acciones de usuario, antes de que la operacion real (api) se realize
    userState,                                                              // Estado inicial del usuario
    (state, value: "follow" | "block") =>                                   // Función que define cómo actualizar el estado optimistamente
      value === "follow"                                                    // En el formulario recibiras un valor "follow" o "block" (switchOptimisticState)
        ? {                                                                 // Si es "follow"
          ...state,                                                         // spread el state del usuario
          following: state.following && false,                              // following: Se establece en false si ya está true
          followingRequestSent:                                             // followingRequestSent: Se establece en true solo si following es false y followingRequestSent también es false.    
            !state.following && !state.followingRequestSent ? true : false,
        }
        : { ...state, blocked: !state.blocked }                             // Cuando value es "block": Alterna el estado blocked entre true y false.
  );
  
  return (
    <>
      <form action={follow}>
        <button className="w-full bg-blue-500 text-white text-sm rounded-md p-2">
          {optimisticState.following
            ? "Following"
            : optimisticState.followingRequestSent
              ? "Friend Request Sent"
              : "Follow"}
        </button>
      </form>
      <form action={block} className="self-end ">
        <button>
          <span className="text-red-400 text-xs cursor-pointer">
            {optimisticState.blocked ? "Unblock User" : "Block User"}
          </span>
        </button>
      </form>
    </>
  );
};

export default UserInfoCardInteraction;