'use client'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

// New component for lazy-loaded NFT card
const NFTCard = ({ nft }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(cardRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className='bg-zinc-900 rounded-xl overflow-hidden shadow-lg transform transition-transform hover:scale-105'
    >
      <div className='w-[95%] mx-auto mt-2 rounded-t-xl h-40 relative'>
        {isVisible && (
          <img 
            src={nft.image} 
            alt={nft.name} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        {(!isVisible || !imageLoaded) && (
          <div className="w-full h-full bg-zinc-800 animate-pulse"/>
        )}
      </div>
      <div className='p-3 text-center'>
        <h3 className='text-white text-sm truncate'>{nft.name}</h3>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
);

const NftList = () => {
  const [collectionsArray, setCollectionsArray] = useState([]);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);
  const [allNftData, setAllNftData] = useState([]);
  const [displayedNftData, setDisplayedNftData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sentinelRef = useRef(null);
  const [currentCollectionTokens, setCurrentCollectionTokens] = useState([]);
  const [loadedTokenCount, setLoadedTokenCount] = useState(0);
  const TOKENS_PER_BATCH = 10;
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [tokenRegistry, setTokenRegistry] = useState(new Map()); // Add this
  const [imageRegistry, setImageRegistry] = useState(new Map()); // Add this
  const [tokenCountMap, setTokenCountMap] = useState(new Map());
  const [isCollectionComplete, setIsCollectionComplete] = useState(false);
  const [uniqueTokenMap, setUniqueTokenMap] = useState(new Map());
  const [processedCount, setProcessedCount] = useState(0);
  const MAX_RETRIES = 3;
  const [uniqueTokenCount, setUniqueTokenCount] = useState(0);
  const [totalCollectionTokens, setTotalCollectionTokens] = useState(0);
  const [seenGifUrls, setSeenGifUrls] = useState(new Set());

  const skipCollections = [
    '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85', // ENS
    '0xb77c7520574795d4cb5766920044a2bfdea6ad1f', // X-Y-Z
    // Add more problematic collections here
  ];

  // Add blacklist function to dynamically add problematic collections
  const addToSkipCollections = (contractAddress) => {
    if (!skipCollections.includes(contractAddress)) {
      skipCollections.push(contractAddress);
      console.log(`Added ${contractAddress} to skip list`);
    }
  };

  const resetCollectionState = () => {
    setTokenRegistry(new Map());
    setImageRegistry(new Map());
    setIsCollectionComplete(false);
    setUniqueTokenCount(0);
    setTotalCollectionTokens(0);
    setSeenGifUrls(new Set());
  };

  const isTokenImagePairUnique = (tokenId, imageUrl) => {
    // Check if token already exists with different image
    if (tokenRegistry.has(tokenId) && tokenRegistry.get(tokenId) !== imageUrl) {
      console.log(`Token ${tokenId} already exists with different image`);
      return false;
    }

    // Check if image already exists with different token
    if (imageRegistry.has(imageUrl) && imageRegistry.get(imageUrl) !== tokenId) {
      console.log(`Image URL already exists with different token ${imageRegistry.get(imageUrl)}`);
      return false;
    }

    return true;
  };

  const registerTokenImagePair = (tokenId, imageUrl) => {
    setTokenRegistry(prev => new Map(prev.set(tokenId, imageUrl)));
    setImageRegistry(prev => new Map(prev.set(imageUrl, tokenId)));
  };

  useEffect(() => {
    async function fetchNFTData() {
      setIsLoading(true);
      try {
        const portfolioResponse = await axios.get("/api/walletportfolio", {
          params: { 
            wallet: "0x7c1958Ba95AB3170f6069DADF4de304B0c00000C"
          }
        });
        
        console.log("Portfolio Response:", portfolioResponse.data);
        console.log("Collections:", portfolioResponse.data.collections);
        
        const rawCollections = portfolioResponse.data.collections;
        const collectionsArr = Object.entries(rawCollections);
        console.log("Collections Array:", collectionsArr);
        
        setCollectionsArray(collectionsArr);
        if(collectionsArr.length > 1) {
          loadCollectionTokens(1, collectionsArr);
        } else {
          console.log("No collections found or insufficient data");
        }
      } catch (error) {
        console.error("Portfolio fetch error:", error.response || error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNFTData();
  }, []);

  async function loadCollectionTokens(index, arr = collectionsArray) {
    if (index >= arr.length) {
      console.log("No more collections to load");
      return;
    }
    
    setIsLoadingContract(true);
    resetCollectionState(); // Reset both token IDs and image URLs
    const [collection, data] = arr[index];
    
    // Validate data before proceeding
    if (!data || !data.contract_address || !data.tokens || !data.tokens.length) {
      console.log(`Invalid collection data for ${collection}, skipping...`);
      loadCollectionTokens(index + 1, arr);
      return;
    }
    
    // Skip collections without images
    if (skipCollections.includes(data.contract_address)) {
      console.log(`Skipping collection ${collection} - no images available`);
      loadCollectionTokens(index + 1, arr);
      return;
    }

    console.log("Loading collection:", collection);
    console.log("Collection data:", data);
    
    setCurrentCollectionTokens(data.tokens);
    setLoadedTokenCount(0);
    
    try {
      // Test first token for valid image
      const testImage = await axios.get("/api/tokenimage", {
        params: {
          blockchain: 1,
          contract_address: data.contract_address,
          token_id: data.tokens[0],
          currency: "usd",
        }
      }).catch(error => {
        if (error.response?.status === 404) {
          console.log(`Collection ${collection} returned 404, adding to skip list`);
          addToSkipCollections(data.contract_address);
        }
        throw error;
      });

      if (!testImage?.data || testImage.data.imageUrl === 'NA') {
        console.log(`Skipping collection ${collection} - invalid images`);
        loadCollectionTokens(index + 1, arr);
        return;
      }

      // Instead of loading all tokens, just load first batch
      const firstBatch = data.tokens.slice(0, TOKENS_PER_BATCH);
      await loadMoreTokensFromCurrentCollection(collection, data, firstBatch);
      setCurrentCollectionIndex(index);
      setProcessedCount(TOKENS_PER_BATCH);
      setIsCollectionComplete(false);
      
      // After validation, set the total possible tokens for this collection
      const uniqueTokens = new Set(data.tokens);
      setTotalCollectionTokens(uniqueTokens.size);
      
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      if (status === 404) {
        console.log(`Skipping collection ${collection} - Not found (404)`);
      } else {
        console.error(`Error loading collection ${collection}:`, errorMessage);
      }

      // Add to skip list if consistently failing
      if (status === 404 || status === 403) {
        addToSkipCollections(data.contract_address);
      }

      loadCollectionTokens(index + 1, arr);
    } finally {
      setIsLoadingContract(false);
    }
  }

  // Helper function to generate unique key
  const generateUniqueKey = (contractAddress, tokenId) => {
    return `${contractAddress}-${tokenId}-${Date.now()}`;
  };

  // Add helper function to check if URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    // Check for common video extensions and IPFS video patterns
    return url.match(/\.(mp4|webm|ogg)$/i) || 
           (url.includes('ipfs') && url.match(/\.(mp4|webm|ogg)$/i));
  };

  // Enhanced URL filtering function
  const isUnsupportedMedia = (url) => {
    if (!url) return false;

    // Check for video formats only
    const videoPattern = /\.(mp4|webm|ogg)$/i;
    const isVideo = url.match(videoPattern) || (url.includes('ipfs') && url.match(videoPattern));

    // Check for duplicate patterns in URL
    const isDuplicate = url.match(/(\d+)\.\1/); // Matches patterns like '2.2'

    // Check if it's a duplicate GIF
    const isGif = url.match(/\.gif$/i) || url.includes('/elementals-images.azuki.com/');
    if (isGif) {
      if (seenGifUrls.has(url)) {
        console.log(`Skipping duplicate GIF: ${url}`);
        return true;
      }
      setSeenGifUrls(prev => new Set([...prev, url]));
      return false;
    }

    return isVideo || isDuplicate;
  };

  async function loadMoreTokensFromCurrentCollection(collection, data, tokenBatch) {
    setIsLoadingTokens(true);
    console.log("Loading token batch for collection:", collection);
    
    const newList = [];
    const processedTokens = new Set();

    for (const tokenId of tokenBatch) {
      // Skip if we've already processed this token
      if (processedTokens.has(tokenId)) continue;
      processedTokens.add(tokenId);

      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          const imageResponse = await axios.get("/api/tokenimage", {
            params: {
              blockchain: 1,
              contract_address: data.contract_address,
              token_id: tokenId,
              currency: "usd",
            },
            timeout: 10000 // 10 second timeout
          }).catch(error => {
            if (error.code === 'ECONNABORTED') {
              throw new Error('Timeout');
            }
            return null;
          });

          if (imageResponse?.data?.imageUrl && 
              imageResponse.data.imageUrl !== 'NA' &&
              !isUnsupportedMedia(imageResponse.data.imageUrl) && // Updated check
              isTokenImagePairUnique(tokenId, imageResponse.data.imageUrl)) {
            
            const newToken = {
              id: `${data.contract_address}-${tokenId}-${Date.now()}`,
              name: `${collection} #${tokenId}`,
              image: imageResponse.data.imageUrl,
              collection: collection,
              contract_address: data.contract_address,
              token_id: tokenId
            };

            registerTokenImagePair(tokenId, imageResponse.data.imageUrl);
            newList.push(newToken);
            break; // Success, exit retry loop
          } else if (isUnsupportedMedia(imageResponse?.data?.imageUrl)) {
            console.log(`Skipping unsupported media for token ${tokenId}: ${imageResponse?.data?.imageUrl}`);
            setTotalCollectionTokens(prev => Math.max(0, prev - 1));
          }
          break; // Got response but not valid, skip retries
        } catch (error) {
          retries++;
          if (retries === MAX_RETRIES) {
            console.error(`Failed to load token ${tokenId} after ${MAX_RETRIES} attempts`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
          }
        }
      }
    }

    if (newList.length > 0) {
      setLoadedTokenCount(prev => prev + newList.length);
      setUniqueTokenCount(prev => prev + newList.length);
      // Ensure no duplicates in final lists
      setAllNftData(prev => {
        const uniqueTokens = [...prev, ...newList].filter((token, index, self) =>
          index === self.findIndex(t => (
            t.token_id === token.token_id && t.contract_address === token.contract_address
          ))
        );
        return uniqueTokens;
      });
      setDisplayedNftData(prev => {
        const uniqueTokens = [...prev, ...newList].filter((token, index, self) =>
          index === self.findIndex(t => (
            t.token_id === token.token_id && t.contract_address === token.contract_address
          ))
        );
        return uniqueTokens;
      });
    }
    setIsLoadingTokens(false);
  }

  async function handleLoadMoreTokens() {
    const [collection, data] = collectionsArray[currentCollectionIndex];
    const nextBatch = data.tokens.slice(
      processedCount,
      processedCount + TOKENS_PER_BATCH
    );
    
    if (nextBatch.length > 0) {
      await loadMoreTokensFromCurrentCollection(collection, data, nextBatch);
      setProcessedCount(prev => prev + TOKENS_PER_BATCH);
      if (processedCount + TOKENS_PER_BATCH >= data.tokens.length) {
        setIsCollectionComplete(true);
      }
    }
  }

  function handleLoadNextContract() {
    loadCollectionTokens(currentCollectionIndex + 1);
  }

  useEffect(() => {
    if (sentinelRef.current) {
      const observer = new IntersectionObserver((entries) => {
        // Load next 10 items when sentinel is in view
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }
  }, [allNftData]);

  function loadMore() {
    const currentCount = displayedNftData.length;
    const nextBatch = allNftData.slice(currentCount, currentCount + 10);
    setDisplayedNftData((prev) => [...prev, ...nextBatch]);
  }

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
        {displayedNftData.map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        {/* Show Load More Tokens button if there are more tokens to load in current collection */}
        {uniqueTokenCount < totalCollectionTokens && (
          <button 
            onClick={handleLoadMoreTokens}
            disabled={isLoadingTokens || isLoadingContract}
            className={`bg-green-500 text-white p-2 flex items-center ${
              (isLoadingTokens || isLoadingContract) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Load More Tokens ({uniqueTokenCount}/{totalCollectionTokens} Unique)
            {isLoadingTokens && <LoadingSpinner />}
          </button>
        )}
        {/* Show Load Next Contract button if all tokens in current collection are loaded */}
        {uniqueTokenCount >= totalCollectionTokens && 
         currentCollectionIndex < collectionsArray.length - 1 && (
          <button 
            onClick={handleLoadNextContract}
            disabled={isLoadingTokens || isLoadingContract}
            className={`bg-blue-500 text-white p-2 flex items-center ${
              (isLoadingTokens || isLoadingContract) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Load Next Contract
            {isLoadingContract && <LoadingSpinner />}
          </button>
        )}
      </div>
      <div ref={sentinelRef} className="h-10" />
    </div>
  );
}

export default NftList