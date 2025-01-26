import React from 'react'
import { SidebarDemo } from '../../../components/SidebarDemo'
import Navbar from './Navbar'
import LineChartAnalytics from './Linechart'

const page = () => {
  return (
    <SidebarDemo>
    <div className='bg-black h-screen w-full overflow-hidden'>
        <Navbar/>
        <LineChartAnalytics/>
    </div>
    </SidebarDemo>
  )
}

export default page