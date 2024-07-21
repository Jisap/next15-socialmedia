"use client"


import React, { useOptimistic, useState } from 'react'
import { FollowRequest, User } from '@prisma/client';
import { acceptFollowRequest, declineFollowRequest } from '@/lib/actions';
import Image from 'next/image';

type RequestWithUser = FollowRequest & {
  sender: User;
};

const FriendRequestList = ({ requests }: { requests: RequestWithUser[] }) => {

  const [requestState, setRequestState] = useState(requests);                           // Estado de la petición (id, senderId, receivedId ...)[]

  const accept = async (requestId: number, userId: string) => {                         // Si pulsamos para aceptar la petición
    removeOptimisticRequest(requestId);                                                 // optimisticamente 1º la borramos de la lista de peticiones
    try {
      await acceptFollowRequest(userId);                                                // 2º hacemos la solicitud a la bd para que también la borre y a continuación cree un seguidor
      setRequestState((prev) => prev.filter((req) => req.id !== requestId));            // Por último actualizamos el state de la lista de peticiones
    } catch (err) { }
  };
  const decline = async (requestId: number, userId: string) => {                        // Si pulsamos para rechazar la petición
    removeOptimisticRequest(requestId);                                                 // optimisticamente 1º la borramos de la lista de peticiones
    try {
      await declineFollowRequest(userId);                                               // 2º hacemos la solicitud a la bd para también la borre 
      setRequestState((prev) => prev.filter((req) => req.id !== requestId));            // Por último actualizamos el state de la lista de peticiones
    } catch (err) { }
  };

  const [optimisticRequests, removeOptimisticRequest] = useOptimistic(                  // Fn removeOptimistic: Borra del estado de la petición []  
    requestState,                                                                       // optimisticRequest se basa en requestState
    (state, value: number) => state.filter((req) => req.id !== value)                   // la petición (requestId) 
  );


  return (
    <div className="">
      {optimisticRequests.map((request) => (
        <div className="flex items-center justify-between" key={request.id}>
          <div className="flex items-center gap-4">
            <Image
              src={request.sender.avatar || "/noAvatar.png"}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold">
              {request.sender.name && request.sender.surname
                ? request.sender.name + " " + request.sender.surname
                : request.sender.username}
            </span>
          </div>
          <div className="flex gap-3 justify-end">
            <form action={() => accept(request.id, request.sender.id)}>
              <button>
                <Image
                  src="/accept.png"
                  alt=""
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              </button>
            </form>
            <form action={() => decline(request.id, request.sender.id)}>
              <button>
                <Image
                  src="/reject.png"
                  alt=""
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FriendRequestList