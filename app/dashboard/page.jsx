import React from 'react'
import { SidebarDemo } from '@/components/SidebarDemo';

const page = ({children}) => {
  return (
    <div>
      <SidebarDemo>{children}</SidebarDemo>

      
    </div>
  )
}

export default page