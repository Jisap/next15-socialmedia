import React from 'react'
import prisma from '@/lib/client'
import { auth } from '@clerk/nextjs/server'
import { User } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import UserInfoCardInteraction from './UserInfoCardInteraction'
//import UserInfoCardInteraction from './UserInfoCardInteraction'

const UserInfoCard = async({ user }:{ user:User }) => {             // Se recibe el objeto del usuario que se quiere ver la info

  const createdAtDate = new Date(user.createdAt);

  const formattedDate = createdAtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let isUserBlocked = false;                                        // Inicializa las variables para verificar si el usuario está bloqueado, 
  let isFollowing = false;                                          // seguido 
  let isFollowingSent = false;                                      // o si la solicitud de seguimiento está enviada.

  const { userId: currentUserId } = auth();                         // Usuario logueado
 
  if (currentUserId) {
    const blockRes = await prisma.block.findFirst({                 // Comprobamos 
      where: {
        blockerId: user.id,                                         // Si el usuario del perfil ha bloqueado
        blockedId: currentUserId,                                   // al usuario autenticado
      },
    });

    blockRes ? (isUserBlocked = true) : (isUserBlocked = false);    // usuario autenticado bloqueado

    const followRes = await prisma.follower.findFirst({             // Comprobamos
      where: {
        followerId: currentUserId,                                  // si el usuario autenticado sigue
        followingId: user.id,                                       // al usuario del perfil.
      },
    });

    followRes ? (isFollowing = true) : (isFollowing = false);       // Usuario autenticado sigue al usuario de perfil

    const followReqRes = await prisma.followRequest.findFirst({     // Comprobamos 
      where: {
        senderId: currentUserId,                                    // si hay una solicitud de seguimiento enviada por el usuario autenticado.
        receiverId: user.id,                                        // al usuario de perfil
      },
    });

    followReqRes ? (isFollowingSent = true) : (isFollowingSent = false);  // Usuario autenticado envio petición de seguimiento
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Information</span>
        <Link href="/" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>

      {/* BOTTOM */}
      <div className='flex flex-col gap-4 text-gray-500'>
        <div className='flex items-center gap-2'>
          <span className='text-xl text-black'>
            {" "}
            {
              user.name && user.surname
                ? user.name + " " + user.surname
                : user.username
            }
          </span>
          <span className='text-sm'>@{user.username}</span>
        </div>

        {user.description && <p>{user.description}</p>}
        {user.city && (
          <div className="flex items-center gap-2">
            <Image src="/map.png" alt="" width={16} height={16} />
            <span>
              Living in <b>{user.city}</b>
            </span>
          </div>
        )}
        {user.school && (
          <div className="flex items-center gap-2">
            <Image src="/school.png" alt="" width={16} height={16} />
            <span>
              Went to <b>{user.school}</b>
            </span>
          </div>
        )}
        {user.work && (
          <div className="flex items-center gap-2">
            <Image src="/work.png" alt="" width={16} height={16} />
            <span>
              Works at <b>{user.work}</b>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {user.website && (
            <div className="flex gap-1 items-center">
              <Image src="/link.png" alt="" width={16} height={16} />
              <Link href={user.website} className="text-blue-500 font-medium">
                {user.website}
              </Link>
            </div>
          )}
          <div className="flex gap-1 items-center">
            <Image src="/date.png" alt="" width={16} height={16} />
            <span>Joined {formattedDate}</span>
          </div>
        </div>

        {currentUserId && currentUserId !== user.id && (
          <UserInfoCardInteraction
            userId={user.id}
            isUserBlocked={isUserBlocked}
            isFollowing={isFollowing}
            isFollowingSent={isFollowingSent}
          />
        )}

        

        
{/* 
        <button className='bg-blue-500 text-white text-sm rounded-md p-2'>Follow</button>
        <span className='text-red-400 self-end text-xs cursor-pointer'>Block User</span> */}
      </div>
    </div>
  )
}

export default UserInfoCard