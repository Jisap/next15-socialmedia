import Image from 'next/image'
import React from 'react'

const ProfileCard = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-6">
      <div className="h-20 relative">
        <Image
          src="/noCover.png"
          alt=""
          fill
          className="rounded-md object-cover"
        />
        <Image
          src="/noAvatar.png"
          alt=""
          width={48}
          height={48}
          className="rounded-full object-cover w-12 h-12 absolute left-0 right-0 m-auto -bottom-6 ring-1 ring-white z-10"
        />
      </div>
    </div>
  )
}

export default ProfileCard