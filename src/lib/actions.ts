"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { revalidatePath } from "next/cache";


export const addPost = async (formData: FormData, img: string) => { // Se reciben la descripción y la imagen

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

export const updateProfile = async (
  prevState: { success: boolean; error: boolean },                          // Estado anterior 
  payload: { formData: FormData; cover: string }                            // Data del formulario + cover
) => {

  const { formData, cover } = payload;                                      // Desestructuramos el cover
  const fields = Object.fromEntries(formData);                              // Object con el resto de campos

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")             // Filtra los campos, eliminando aquellos cuyos valores sean cadenas vacías 
  );

  const Profile = z.object({                                                // Reglas de validación del formulario
    cover: z.string().optional(),
    name: z.string().max(60).optional(),
    surname: z.string().max(60).optional(),
    description: z.string().max(255).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });

  const validatedFields = Profile.safeParse({ cover, ...filteredFields });  // Se validan los campos

  if (!validatedFields.success) {                                           // Si la validación falla, se registran los errores en la consola 
    console.log(validatedFields.error.flatten().fieldErrors);               // y se devuelve un objeto indicando el fracaso de la operación.
    return { success: false, error: true };
  }

  const { userId } = auth();

  if (!userId) {
    return { success: false, error: true };
  }

  try {                                                                       
    await prisma.user.update({                                              // actualizar el perfil del usuario en la base de datos utilizando prisma.user.update
      where: {
        id: userId,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deletePost = async (postId: number) => {

  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.delete({
      where: {
        id: postId,
        userId,
      },
    });
    revalidatePath("/")
  } catch (err) {
    console.log(err);
  }
};

export const switchLike = async (postId: number) => {            // Se recibe el id del post sobre el que se hace o no like

  const { userId } = auth();                                     // Usuario logueado

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingLike = await prisma.like.findFirst({           // Obtenemos [like] correspondientes 
      where: {
        postId,                                                  // al id del post
        userId,                                                  // y al usuario logueado que hace like o no
      },
    });

    if (existingLike) {                                          // Si el [like] ya existía se borra
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({                                 // Si el [like] no existía se crea
        data: {
          postId,
          userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

export const addComment = async (postId: number, desc: string) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const createdComment = await prisma.comment.create({
      data: {
        desc,
        userId,
        postId,
      },
      include: {
        user: true,
      },
    });

    return createdComment;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addStory = async (img: string) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingStory = await prisma.story.findFirst({
      where: {
        userId,
      },
    });

    if (existingStory) {
      await prisma.story.delete({
        where: {
          id: existingStory.id,
        },
      });
    }
    const createdStory = await prisma.story.create({
      data: {
        userId,
        img,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: true,
      },
    });

    return createdStory;
  } catch (err) {
    console.log(err);
  }
};


