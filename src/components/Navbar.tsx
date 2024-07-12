import Link from 'next/link'
import React from 'react'
import MobileMenu from './MobileMenu'

const Navbar = () => {
  return (
    <div className='h-24 flex items-center justify-between'>
      {/* left */}
      <div className='font-bold text-xl text-blue-600'>
        <Link href='/'>
          N15 SocialMedia
        </Link>
      </div>

      {/* center */}
      <div className='hidden'>

      </div>

      {/* right */}
      <div className=''>
        <MobileMenu />
      </div>
    </div>
  )
}

export default Navbar