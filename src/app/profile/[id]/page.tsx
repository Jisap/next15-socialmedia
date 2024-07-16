import Feed from '@/components/feed/Feed'
import LeftMenu from '@/components/leftmenu/LeftMenu'
import RightMenu from '@/components/rightMenu/RightMenu'
import React from 'react'

const ProfilePage = () => {
  return (
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu />
      </div>
      <div className='w-full lg:w-[70%] xl:w-[50%]'>
        <div className='flex flex-col gap-6'>
          <Feed />
        </div>
        <div className='hidden lg:block w-[30%]'>
          <RightMenu />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage