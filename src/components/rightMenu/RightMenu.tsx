import React from 'react'
import FriendRequest from './FriendRequest'
import Birthdays from './Birthdays'
import Ad from '../Ad'

const RightMenu = ({ userId }:{ userId?:string }) => {
  return (
    <div className='flex flex-col gap-6'>
      <FriendRequest />
      <Birthdays />
      <Ad size="md"/>
    </div>
  )
}

export default RightMenu