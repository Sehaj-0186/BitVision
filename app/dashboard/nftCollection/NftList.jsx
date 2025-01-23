'use client'
import React, { useState, useEffect } from 'react'

const NftList = () => {
  const [nftData, setNftData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNftData = () => {
      const sampleNftData = [
        { 
          id: 1, 
          name: "Cool Monkey #1", 
          image: "https://picsum.photos/200/300?random=1",
        },
        { 
          id: 2, 
          name: "Cyber Punk NFT", 
          image: "https://picsum.photos/200/300?random=2",
        },
        { 
          id: 3, 
          name: "Abstract Art #3", 
          image: "https://picsum.photos/200/300?random=3",
        },
        { 
          id: 4, 
          name: "Digital Landscape", 
          image: "https://picsum.photos/200/300?random=4",
        },
        { 
          id: 5, 
          name: "Futuristic Design", 
          image: "https://picsum.photos/200/300?random=5",
        },
        { 
            id: 6, 
            name: "Futuristic Design", 
            image: "https://picsum.photos/200/300?random=5",
          }
          ,
        { 
            id: 7, 
            name: "Futuristic Design", 
            image: "https://picsum.photos/200/300?random=5",
          }
          ,
        { 
            id: 8, 
            name: "Futuristic Design", 
            image: "https://picsum.photos/200/300?random=5",
          }
          ,
        { 
            id: 9, 
            name: "Futuristic Design", 
            image: "https://picsum.photos/200/300?random=5",
          }
      ]

      setNftData(sampleNftData)
      setIsLoading(false)
    }

    fetchNftData()
  }, [])

  if (isLoading) {
    return (
      <div className='w-[95%] mx-auto bg-zinc-950 h-[50vh] flex justify-center items-center'>
        <span className='text-white'>Loading NFTs...</span>
      </div>
    )
  }

  return (
    <div className='w-[95%] mx-auto bg-zinc-950 h-[calc(100vh-150px)] overflow-y-auto p-4'>
        <div className='text-3xl font-thin my-5'>NFT List</div>
      <div className='grid grid-cols-6 gap-6'>
        {nftData.map((nft) => (
          <div 
            key={nft.id} 
            className='bg-zinc-900 rounded-xl overflow-hidden shadow-lg transform transition-transform hover:scale-105'
          >
            <img 
              src={nft.image} 
              alt={nft.name} 
              className='w-[95%] mx-auto mt-2 rounded-t-xl h-40 object-cover'
            />
            <div className='p-3 text-center'>
              <h3 className='text-white text-sm truncate'>{nft.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NftList