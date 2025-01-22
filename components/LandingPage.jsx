import React from 'react'
import Navbar from './Navbar'
import bg from '../images/mjy11.jpg'
import Image from 'next/image'
import Hero from './Hero'

const LandingPage = () => {
  return (
    <div>
        <Image
          src={bg}
          layout="fill"
          objectFit="cover"
          quality={100}
          alt="background"
          className="opacity-95"
        />
        <Navbar />
        <Hero />
        
    </div>
  )
}

export default LandingPage