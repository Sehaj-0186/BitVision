'use client'
import React from 'react'
import Navbar from './Navbar'
import bg from '../images/mjy11.jpg'
import Image from 'next/image'
import Hero from './Hero'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import Link from "next/link"
import { useAppContext } from '@/app/context'

const LandingPage = () => {
  
   const { isClicked } = useAppContext();

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
      {isClicked && <p className="text-green-500 text-center">Redirecting to dashboard...</p>}
    </div>
  )
}

export default LandingPage