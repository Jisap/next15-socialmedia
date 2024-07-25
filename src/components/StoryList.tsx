"use client"

import React, { useOptimistic, useState } from 'react'
import Image from 'next/image'
import { addStory } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { Story, User } from '@prisma/client';
import { CldUploadWidget } from 'next-cloudinary';

type StoryWithUser = Story & { // Se define un type con la Story y el usuario que la creo.
  user: User;
};

const StoryList = ({
  stories,
  userId,
}: {
  stories: StoryWithUser[]; // Las StoryWithUser se definen como un [{}]
  userId: string;
}) => {

  const [storyList, setStoryList] = useState(stories);                // Estado de storyList por defecto con [{}] pasado como prop

  const [img, setImg] = useState<any>();                              // Imagen definida por el widget

  const { user, isLoaded } = useUser();                               // Usuario logueado  

  const add = async () => {
    if (!img?.secure_url) return;

    addOptimisticStory({                                              // Estado optimista define solo la imagen seleccionada por el usuario                                         
      id: Math.random(),
      img: img.secure_url,
      createdAt: new Date(Date.now()),                                // La fecha de creación
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),          // y la de expiración
      userId: userId,
      user: {
        id: userId,
        username: "Sending...",
        avatar: user?.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(Date.now()),
      },
    });

    try {                                                             // Terminada la actualización optimista del estado,
      const createdStory = await addStory(img.secure_url);            // se añade la imagen a la story en bd,
      setStoryList((prev) => [createdStory!, ...prev]);               // se añade la story en storyList,
      setImg(null)                                                    // y se anula la imagen 
    } catch (err) { }
  };

  const [optimisticStories, addOptimisticStory] = useOptimistic(      // El estado optimista
    storyList,                                                        // recibe el estado de storyList 
    (state, value: StoryWithUser) => [value, ...state]                // y lo actualiza con addOptimisticStory y sus valores por defecto + imagen seleccioanda por el usuario  
  );

  return (
    <>
      <CldUploadWidget
        uploadPreset="social"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          return (
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer relative"
            >
              <Image
                src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
                alt=""
                width={80}
                height={80}
                className="w-20 h-20 rounded-full ring-2 object-cover"
                onClick={() => open()}
              />
              {img ? (
                <form action={add}>
                  <button className="text-xs bg-blue-500 p-1 rounded-md text-white">
                    Send
                  </button>
                </form>
              ) : (
                <span className="font-medium">Add a Story</span>
              )}
              <div className="absolute text-6xl text-gray-200 top-1">+</div>
            </div>
          );
        }}
      </CldUploadWidget>
    
      {/* STORY */}
      {optimisticStories.map((story) => (
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          key={story.id}
        >
          <Image
            src={story.img || "/noAvatar.png"}
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2 object-cover"
          />
          <span className="font-medium">
            {story.user.name || story.user.username}
          </span>
        </div>
      ))}
    </>
  )
}

export default StoryList