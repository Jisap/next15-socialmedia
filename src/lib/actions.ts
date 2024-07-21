"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { revalidatePath } from "next/cache";


export const addPost = async (formData: FormData, img: string) => { // Se reciben la desc y la imagen

  const desc = formData.get("desc") as string;                      // Se obtiene la descripción del formulario y se castea a string.

  const Desc = z.string().min(1).max(255);                          // Se define un esquema de validación usando zod 

  const validatedDesc = Desc.safeParse(desc);                       // Se valida la descripción usando safeParse de zod, que retorna un objeto con el resultado de la validación.

  if (!validatedDesc.success) {                                     // Si la validación falla 
    //TODO
    console.log("description is not valid");                        // mensaje de error  
    return;
  }
  const { userId } = auth();                                        // Si pasa la validadción Se obtiene el ID del usuario autenticado usando la función auth.

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.create({                                      // Se crear un nuevo post en la base de datos 
      data: {
        desc: validatedDesc.data,
        userId,
        img,
      },
    });

    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};

export const switchFollow = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }

  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });

      if (existingFollowRequest) {
        await prisma.followRequest.delete({
          where: {
            id: existingFollowRequest.id,
          },
        });
      } else {
        await prisma.followRequest.create({
          data: {
            senderId: currentUserId,
            receiverId: userId,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const switchBlock = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingBlock = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: userId,
      },
    });

    if (existingBlock) {
      await prisma.block.delete({
        where: {
          id: existingBlock.id,
        },
      });
    } else {
      await prisma.block.create({
        data: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const acceptFollowRequest = async (userId: string) => {            // Fn para aceptar solicitudes de amistad de un usuario (userId)

  const { userId: currentUserId } = auth();                               // usuario logueado renombrado a currentUserId

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({  // 1º buscamos la petición existente de amistad en folloRequest
      where: {
        senderId: userId,                                                 // enviadas por un usuario
        receiverId: currentUserId,                                        // al usuario logueado
      },
    });

    if (existingFollowRequest) {                                          // si ya existía
      await prisma.followRequest.delete({                                 // la borramos de la lista de peticiones de amistad
        where: {
          id: existingFollowRequest.id,
        },
      });

      await prisma.follower.create({                                      // 2º creamos un seguidor
        data: { 
          followerId: userId,                                             // con el id del usuario que hizo la petición
          followingId: currentUserId,                                     // para seguir al usuario logueado
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const declineFollowRequest = async (userId: string) => {           // Fn para rechazar solicitudes de amistad de un usuario (userId)

  const { userId: currentUserId } = auth();                               // usuario logueado renombrado a currentUserId

  if (!currentUserId) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({  // 1º buscamos la petición existente de amistad en folloRequest
      where: {
        senderId: userId,                                                 // enviadas por un usuario
        receiverId: currentUserId,                                        // al usuario logueado
      },
    });

    if (existingFollowRequest) {                                          // Si ya existía
      await prisma.followRequest.delete({                                 // procedemos a borrarla
        where: {
          id: existingFollowRequest.id,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};