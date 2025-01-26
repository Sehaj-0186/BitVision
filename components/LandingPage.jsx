"use client";
import React from "react";
import Navbar from "./Navbar";
import bg from "../images/bgLandingPage.jpg";
import Image from "next/image";
import Hero from "./Hero";
import { useAppContext } from "./context/index";

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
      {isClicked && (
        <p className="text-green-500 text-center">
          Redirecting to dashboard...
        </p>
      )}
    </div>
  );
};

export default LandingPage;
