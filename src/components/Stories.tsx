import React from 'react'
import StoryList from './StoryList'

const Stories = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md overflow-scroll text-xs scrollbar-hide">
      <div className="flex gap-8 w-max">
        <StoryList />
      </div>
    </div>
  )
}

export default Stories