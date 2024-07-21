import React, { Suspense } from 'react'
import FriendRequest from './FriendRequest'
import Birthdays from './Birthdays'
import Ad from '../Ad'
import UserInfoCard from './UserInfoCard'
import UserMediaCard from './UserMediaCard'
import { User } from '@prisma/client'

const RightMenu = ({ user }:{ user?:User }) => { // user es opcional, solo se obtendrá si accedemos a RightMenu desde ProfilePage
  return (
    <div className='flex flex-col gap-6'>
      {
        user ? (
          <>
            <Suspense fallback="loading...">
              <UserInfoCard user={user} />
            </Suspense>
            <Suspense fallback="loading...">
              <UserMediaCard user={user} />
            </Suspense>
          </>
        ) : null
      }
      <FriendRequest />
      <Birthdays />
      <Ad size="md"/>
    </div>
  )
}

export default RightMenu