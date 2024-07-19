import Feed from '@/components/feed/Feed'
import LeftMenu from '@/components/leftmenu/LeftMenu'
import RightMenu from '@/components/rightMenu/RightMenu'
import prisma from '@/lib/client'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'

const ProfilePage = async({ params }: { params: { username: string } }) => {

  const username = params.username;                              // Usuario que viene en la url (desde ProfileCard u otra página)

  const user = await prisma.user.findFirst({                     // Buscamos el usuario en bd según username (usuario cuyo perfil se esta viendo)
    where: {
      username,
    },
    include: {
      _count: {
        select: {
          followers: true,
          followings: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return notFound();

  const { userId: currentUserId } = auth();                       // Id del Usuario logueado

  let isBlocked;

  if (currentUserId) {                                            // Si existe el id del usuario logueado
    const res = await prisma.block.findFirst({                    // buscamos en bd los usuario bloqueados contenidos en block[]
      where: {                                                    // Comprobamos si el usuario autenticado (currentUserId)
        blockerId: user.id,                                       // está bloqueado por el usuario cuyo perfil se está viendo (user.id)
        blockedId: currentUserId,
      },
    });

    if (res) isBlocked = true;                                    // Si es así, devuelve una página de "no encontrado"
  } else {
    isBlocked = false;
  }

  if (isBlocked) return notFound();
  
  return (
    <div className='flex gap-6 pt-6'>
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="profile"/>
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-64 relative">
              <Image
                src={user.cover || "/noCover.png"}
                alt=""
                fill
                className="rounded-md object-cover"
              />
              <Image
                src={user.avatar || "/noAvatar.png"}
                alt=""
                width={128}
                height={128}
                className="w-32 h-32 rounded-full absolute left-0 right-0 m-auto -bottom-16 ring-4 ring-white object-cover"
              />
            </div>
            <h1 className="mt-20 mb-4 text-2xl font-medium">
              {
                user.name && user.surname
                  ? user.name + " " + user.surname
                  : user.username
              }
            </h1>

            <div className="flex items-center justify-center gap-12 mb-4">
              <div className="flex flex-col items-center">
                <span className="font-medium">{user._count.posts}</span>
                <span className="text-sm">Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-medium">{user._count.followers}</span>
                <span className="text-sm">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-medium">{user._count.followings}</span>
                <span className="text-sm">Following</span>
              </div>
            </div>
          </div>
          <Feed />
        </div>
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu user={user} />
      </div>
    </div>
  )
}

export default ProfilePage