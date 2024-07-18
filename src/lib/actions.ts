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