"use client"

import { useUser } from '@clerk/nextjs';
import Image from 'next/image'
import React, { useState } from 'react'

const StoryList = () => {

  const [img, setImg] = useState<any>();

  const { user, isLoaded } = useUser();

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer relative">
      <Image
        src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
        alt=""
        width={80}
        height={80}
        className="w-20 h-20 rounded-full ring-2 object-cover"
        //onClick={() => open()}
      />
      <span className="font-medium">Jisap</span>
    </div>
  )
}

export default StoryList