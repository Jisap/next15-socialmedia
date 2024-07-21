import prisma from '@/lib/client'
import { auth } from '@clerk/nextjs/server'
import { request } from 'http'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import FriendRequestList from './FriendRequestList'

const FriendRequest = async () => {

  const { userId } = auth()
  if(!userId) return null;

  const requests = await prisma.followRequest.findMany({ // Peticiones de amistad
    where: {
      receiverId: userId                                 // para el usuario logueado 
    },
    include:{                                            // incluyendo toda la info del usuario que hace la petición   
      sender: true
    },
  })

  if(requests.length === 0) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">Friend Requests</span>
        <Link href="/" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* USER */}
      <FriendRequestList requests={requests} />

    </div>
  );
}

export default FriendRequest