'use client';
import { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback 
} from 'react';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { useAccount } from 'wagmi';


const formatNumber = (number) => {
  if (number === null || number === undefined) return '0.0000';
  return Number(number).toFixed(2);
};

const getRiskScoreColor = (score) => {
  if (!score && score !== 0) return '#fff';
  const minScore = 0;
  const maxScore = 100;
  const boundedScore = Math.max(minScore, Math.min(score, maxScore));
  const ratio = boundedScore / maxScore;
  const r = Math.floor(255 * (1 - ratio));
  const g = Math.floor(255 * ratio);
  return `rgb(${r}, ${g}, 0)`;
};

const calculateRiskStatus = (data) => {
  let score = 100; 


  if (data.washTradedVolume > 0) {
    score -= 40;
  }

  
  const suspectSalesRatio = data.sales > 0 ? 
    (data.washTradedVolume / data.sales) : 0;
  if (suspectSalesRatio > 0.1) { 
    score -= 15;
  }

  
  const connectedWalletsThreshold = 5;
  if (data.transfers / data.transactions > connectedWalletsThreshold) {
    score -= 15;
  }

  
  if (data.floor_price === 0 || !data.floor_price) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score)); 
};

const getRiskStatusLabel = (score) => {
  if (score >= 80) return 'Very Safe';
  if (score >= 60) return 'Safe';
  if (score >= 40) return 'Moderate Risk';
  if (score >= 20) return 'High Risk';
  return 'Very High Risk';
};


const SkeletonBox = () => (
  <div className="bg-zinc-800 rounded-lg h-[80px] animate-pulse"/>
);

const SkeletonPieChart = () => (
  <div className="w-full h-[250px] bg-zinc-900 rounded-full animate-pulse"/>
);

export default function Portfolio() {

  const [isMounted, setIsMounted] = useState(false);
  const [radius, setRadius] = useState(50);
  const [isHidden, setIsHidden] = useState(true);
  const [walletDataList, setWalletDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionsData, setCollectionsData] = useState([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [error, setError] = useState(null);
  const [marketplaceRewards, setMarketplaceRewards] = useState({});

 
  const pieChartData = useMemo(() => {
    if (!collectionsData.length) return [];
    return collectionsData
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map(collection => ({
        ...collection,
        label: collection.label.length > 15 
          ? `${collection.label.substring(0, 12)}...` 
          : collection.label
      }));
  }, [collectionsData]);

  const safePortfolioData = useMemo(() => {
    if (!walletDataList.length) return {
      realizedProfit: '0.0000',
      unrealizedProfit: '0.0000',
      totalPL: '0.0000',
      estimatedPortfolioValue: '0.0000',
      totalVolume: '0.0000',
      riskScore: 0,
      riskLabel: 'Unknown'
    };
    const data = walletDataList[0];
    const riskScore = calculateRiskStatus({
      washTradedVolume: data.wash_trade_volume || 0,
      sales: data.sales || 0,
      transfers: data.transfers || 0,
      transactions: data.transactions || 1,
      floor_price: data.floor_price
    });

    return {
      realizedProfit: formatNumber(data.sell_volume - data.buy_volume),
      unrealizedProfit: formatNumber(data.minted_value),
      totalPL: formatNumber((data.sell_volume - data.buy_volume) + data.minted_value),
      estimatedPortfolioValue: formatNumber(data.minted_value + data.buy_volume),
      totalVolume: formatNumber(data.buy_volume + data.sell_volume),
      riskScore,
      riskLabel: getRiskStatusLabel(riskScore)
    };
  }, [walletDataList]);

  const safeTradingData = useMemo(() => {
    if (!walletDataList.length) return {
      nftsBought: 0,
      nftsSold: 0,
      buyVolume: '0.0000',
      sellVolume: '0.0000',
    };
    const data = walletDataList[0];
    return {
      nftsBought: data.nft_bought,
      nftsSold: data.nft_sold,
      buyVolume: formatNumber(data.buy_volume),
      sellVolume: formatNumber(data.sell_volume),
    };
  }, [walletDataList]);

  const riskAnalysis = useMemo(() => {
    if (!walletDataList.length) return {
      suspiciousActivityDetected: false,
      washTradedNFTs: 0,
      washTradedVolume: 0
    };
    const data = walletDataList[0];
    return {
      suspiciousActivityDetected: data.transactions > 100,
      washTradedNFTs: Math.floor(data.transfers * 0.1),
      washTradedVolume: Math.floor(data.sell_volume * 0.1)
    };
  }, [walletDataList]);


  const nftOverview = useMemo(() => {
    if (!walletDataList.length) return {
      minted: 0,
      burnt: 0,
      transferred: 0,
      received: 0
    };
    const data = walletDataList[0];
    return {
      minted: data.nft_mint || 0,
      burnt: data.nft_burn || 0,
      transferred: data.nft_transfer || 0,
      received: data.transfers || 0
    };
  }, [walletDataList]);

const {address}=useAccount();
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [analysisResponse, portfolioResponse, rewardsResponse] =
        await Promise.all([
          axios.get("/api/walletanalysis", {
            params: {
              wallet: `${address}`,
              blockchain: "ethereum",
              time_range: "all",
              sort_by: "volume",
              sort_order: "desc",
            },
          }),
          axios.get("/api/walletportfolio", {
            params: {
              wallet: `${address}`,
            },
          }),
          axios
            .get("/api/marketplacerewards", {
              params: {
                wallet: `${address}`,
              },
            })
            .catch((error) => {
              console.warn("Marketplace rewards fetch failed:", error);
              return { data: { blur: 0, looks: 0 } };
            }),
        ]);

      if (analysisResponse.data?.data) {
        const processedData = analysisResponse.data.data.map(item => ({
          blockchain: item.blockchain,
          buy_volume: item.buy_volume || 0,
          minted_value: item.minted_value || 0,
          nft_bought: item.nft_bought || 0,
          nft_burn: item.nft_burn || 0,
          nft_mint: item.nft_mint || 0,
          nft_sold: item.nft_sold || 0,
          nft_transfer: item.nft_transfer || 0,
          sales: item.sales || 0,
          sell_volume: item.sell_volume || 0,
          transactions: item.transactions || 0,
          transfers: item.transfers || 0,
        }));
        setWalletDataList(processedData);
      }

      if (portfolioResponse.data?.collections) {
        const collections = Object.entries(portfolioResponse.data.collections)
          .map(([name, data]) => ({
            label: name,
            value: data.tokens.length
          }));
        setCollectionsData(collections);
      }

      
      setMarketplaceRewards({
        blur: rewardsResponse?.data?.blur || 0,
        looks: rewardsResponse?.data?.looks || 0
      });

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingPortfolio(false);
      setIsLoadingAnalysis(false);
      setIsLoadingCollections(false);
    }
  }, []);

 
  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, [fetchData]);


  function GradientCircularProgress() {
      return (
        <>
          <svg width={0} height={0}>
            <defs>
              <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e01cd5" />
                <stop offset="100%" stopColor="#3052fc" />
              </linearGradient>
            </defs>
          </svg>
          <CircularProgress size="30px" sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
        </>
      );
    }


  if (!isMounted) return null;
  if (error) {
    return (
      <div className="w-[95%] mx-auto my-4 p-4 bg-red-500/10 text-red-500 rounded-lg">
        Error loading data: {error}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="w-[95%] mx-auto my-4 flex justify-center items-center h-[400px]">
        <GradientCircularProgress />
      </div>
    );
  }

 
  if (!walletDataList.length || !collectionsData.length) {
    return (
      <div className="w-[95%] mx-auto my-4 p-4 bg-zinc-900 text-gray-400 rounded-lg text-center">
        No data available
      </div>
    );
  }

  
  return (
    <>
      <div className="w-[95%] mx-auto my-4 flex">
        <div className="flex flex-col w-[30%] my-8  justify-between">
          <Box className="bg-black h-[50%] w-[400px] flex flex-col justify-center mx-auto">
            <div className=" text-2xl text-white ml-10">
              Collections Distribution
              <br />
              <span className="text-sm text-gray-400 italic ml-5">
                (Top 10 collections by NFT count)
              </span>
            </div>
            {isLoadingCollections ? (
              <SkeletonPieChart />
            ) : pieChartData.length > 0 ? (
              <PieChart
                height={250}
                series={[
                  {
                    data: pieChartData,
                    innerRadius: radius,
                    highlightScope: { faded: "global", highlighted: "item" },
                    valueFormatter: (value) => `${value.value} NFTs`,
                    arcLabel: (item) => "",
                    arcLabelMinAngle: 0,
                  },
                ]}
                slotProps={{
                  legend: { hidden: isHidden },
                  tooltip: {
                    sx: {
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      color: "white",
                      borderRadius: 1,
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    },
                    content: ({ item }) => {
                      if (!item) return null;
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{item.data.label}</div>
                          <div className="text-orange-400">
                            {item.data.value} NFTs
                          </div>
                        </div>
                      );
                    },
                  },
                }}
              />
            ) : (
              <div className="flex justify-center items-center h-[250px] text-gray-400">
                No collections found
              </div>
            )}
          </Box>
          <div className=" w-full h-[50%] flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 gap-4 p-2 rounded-xl h-[60%] w-[90%] bg-zinc-900">
              <div className="col-span-2 ">
                {" "}
                
                <h3 className="text-lg text-white px-4 py-2">NFTs Overview</h3>
              </div>
              <div className="rounded-lg justify-between flex flex-col p-2">
                <p className="text-gray-300 text-sm">Minted:</p>
                <p className="text-white text-[25px]">{nftOverview.minted}</p>
              </div>
              <div className="rounded-lg justify-between flex flex-col p-2">
                <p className="text-gray-300 text-sm">Burnt:</p>
                <p className="text-white text-[25px]">{nftOverview.burnt}</p>
              </div>
              <div className="rounded-lg justify-between flex flex-col p-2">
                <p className="text-gray-300 text-sm">Transferred:</p>
                <p className="text-white text-[25px]">{nftOverview.transferred}</p>
              </div>
              <div className="rounded-lg justify-between flex flex-col p-2">
                <p className="text-gray-300 text-sm">Received:</p>
                <p className="text-white text-[25px]">{nftOverview.received}</p>
              </div>
            </div>

           
            <div className="bg-zinc-900 w-[90%] mx-auto mt-4 p-4 rounded-lg">
              <h3 className="text-lg text-white mx-3">Marketplace Rewards</h3>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className=" h-[70px] rounded-lg  justify-between flex flex-col">
                  <span className="text-gray-300 text-sm mt-1 ml-2">Blur:</span>

                  <span className="text-white text-[25px] mb-1 ml-2">
                    {formatNumber(marketplaceRewards?.blur || 0)}
                  </span>
                </div>
                <div className=" h-[70px] rounded-lg  justify-between flex flex-col">
                  <span className="text-gray-300 text-sm mt-1 ml-2">
                    Looks:
                  </span>

                  <span className="text-white text-[25px] mb-1 ml-2">
                    ${formatNumber(marketplaceRewards?.looks || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[70%] bg-black p-4 rounded-lg">
         
          <div className="mb-4 bg-zinc-900 p-6 rounded-2xl">
            <h3 className="text-lg text-white mb-2 ">Portfolio Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              {isLoadingPortfolio ? (
                [...Array(6)].map((_, i) => <SkeletonBox key={i} />)
              ) : (
                <>
                  <div className=" rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Realized Profit:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safePortfolioData.realizedProfit}
                    </p>
                  </div>
                  <div className=" rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Unrealized Profit:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safePortfolioData.unrealizedProfit}
                    </p>
                  </div>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Total P&L:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safePortfolioData.totalPL}
                    </p>
                  </div>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Est. Portfolio Value:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safePortfolioData.estimatedPortfolioValue}
                    </p>
                  </div>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Total Volume:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safePortfolioData.totalVolume}
                    </p>
                  </div>
                  <div className="rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">Risk Status:</p>
                    <div className="flex items-center gap-2">
                      <p
                        style={{
                          color: getRiskScoreColor(safePortfolioData.riskScore)
                        }}
                        className="text-3xl mb-1 ml-2"
                      >
                        {safePortfolioData.riskScore}/100
                      </p>
                      <span className={`text-sm px-2 py-1 rounded ${
                        safePortfolioData.riskScore >= 60 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {safePortfolioData.riskLabel}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        
          <div className="mb-4 bg-zinc-900 p-6 rounded-2xl">
            <h3 className="text-lg text-white mb-2">Trading Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              {isLoadingAnalysis ? (
                [...Array(4)].map((_, i) => <SkeletonBox key={i} />)
              ) : (
                <>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      NFTs Bought:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      {safeTradingData.nftsBought}
                    </p>
                  </div>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      NFTs Sold:
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      {safeTradingData.nftsSold}
                    </p>
                  </div>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Buy Volume (in $):
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safeTradingData.buyVolume}
                    </p>
                  </div>
                  <div className="  rounded-lg justify-between flex flex-col">
                    <p className="text-gray-300 text-sm mt-1 ml-2">
                      Sell Volume (in $):
                    </p>
                    <p className="text-white text-[25px] mb-1 ml-2">
                      ${safeTradingData.sellVolume}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        
          <div className="mb-4 bg-zinc-900 p-6 rounded-2xl">
            <h3 className="text-lg text-white mb-2">Risk Analysis</h3>
            {isLoadingAnalysis ? (
              <>
                <div className="bg-zinc-900 h-[56px] rounded-2xl animate-pulse mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <SkeletonBox key={i} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2 bg-zinc-950 px-6 py-4 rounded-2xl">
                  {riskAnalysis.suspiciousActivityDetected ? (
                    <>
                      <ShieldCheck color="green" />
                      No Suspicious activity detected.
                    </>
                  ) : (
                    <>
                      <ShieldAlert color="red" /> Suspicious activity detected.
                    </>
                  )}
                </div>
              
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className=" h-[70px] rounded-lg  justify-between flex flex-col">
                    <span className="text-gray-300 text-sm mt-1 ml-2">
                      Wash Traded NFTs:
                    </span>
                    <span className="text-white text-[25px] mb-1 ml-2">
                      {riskAnalysis.washTradedNFTs}
                    </span>
                  </div>
                  <div className=" h-[70px] rounded-lg justify-between flex flex-col">
                    <span className="text-gray-300 text-sm mt-1 ml-2">
                      Wash Traded Volume (in $):
                    </span>
                    <span className="text-white text-[25px] mb-1 ml-2">
                      ${riskAnalysis.washTradedVolume}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>{" "}
     
      </div>{" "}
    
    </>
  );
}
