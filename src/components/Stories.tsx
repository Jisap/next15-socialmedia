import React from 'react'
import StoryList from './StoryList'
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/client';

const Stories = async() => {

  const { userId: currentUserId } = auth();
  if (!currentUserId) return null;

  const stories = await prisma.story.findMany({   // Recuperamos las stories
    where: {
      expiresAt: {                                // filtra las historias cuya propiedad expiresAt es mayor (es decir, posterior) que la fecha y hora actual (new Date()). 
        gt: new Date(),                           // Esto significa que solo se seleccionan las historias que aún no han expirado.
      },
      OR: [
        {                                         // se seleccionan las historias   
          user: {                                 // cuyo usuario tiene al menos un seguidor
            followers: {
              some: {
                followerId: currentUserId,        // cuyo followerId es igual a currentUserId, es decir ese usuario sigue al usuario autenticado.
              },
            },
          },
        },
        {
          userId: currentUserId,                  // También se están buscando historias publicadas por el usuario actual.
        },
      ],
    },
    include: {
      user: true,
    },
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md overflow-scroll text-xs scrollbar-hide">
      <div className="flex gap-8 w-max">
        <StoryList 
          stories={stories} 
          userId={currentUserId} 
        />
      </div>
    </div>
  )
}

export default Stories