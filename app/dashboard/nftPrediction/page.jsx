import React from 'react'
import { SidebarDemo } from "../../../components/SidebarDemo";
import Navbar from "./Navbar";
import PredictorComponent from "./PredictorComponent"

const page = () => {
  return (
    <SidebarDemo>
    <div className="bg-black h-screen w-full overflow-hidden ">
      <Navbar />
     <PredictorComponent/>
    </div>
  </SidebarDemo>
  )
}

export default page