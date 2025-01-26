"use client"

import * as React from "react"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart"
import { Bitcoin } from "lucide-react"
import { FaEthereum } from "react-icons/fa"
import { SiSolana, SiBinance, SiCardano } from "react-icons/si"

// Cryptocurrency price data
const cryptoData = {
  daily: [
    { date: "2024-01-01", bitcoin: 42000, ethereum: 2300, solana: 100, binance: 300, cardano: 0.50 },
    { date: "2024-01-02", bitcoin: 42500, ethereum: 2350, solana: 102, binance: 305, cardano: 0.52 },
    { date: "2024-01-03", bitcoin: 43000, ethereum: 2400, solana: 105, binance: 310, cardano: 0.53 },
    { date: "2024-01-04", bitcoin: 42800, ethereum: 2380, solana: 103, binance: 308, cardano: 0.51 },
    { date: "2024-01-05", bitcoin: 43200, ethereum: 2420, solana: 106, binance: 312, cardano: 0.54 },
    { date: "2024-01-06", bitcoin: 43500, ethereum: 2450, solana: 108, binance: 315, cardano: 0.55 },
  ],
  weekly: [
    { date: "Week 1", bitcoin: 42000, ethereum: 2300, solana: 100, binance: 300, cardano: 0.50 },
    { date: "Week 2", bitcoin: 44000, ethereum: 2400, solana: 110, binance: 320, cardano: 0.55 },
    { date: "Week 3", bitcoin: 45000, ethereum: 2500, solana: 120, binance: 340, cardano: 0.60 },
    { date: "Week 4", bitcoin: 46000, ethereum: 2600, solana: 130, binance: 360, cardano: 0.65 },
  ],
  monthly: [
    { date: "January", bitcoin: 42000, ethereum: 2300, solana: 100, binance: 300, cardano: 0.50 },
    { date: "February", bitcoin: 47000, ethereum: 2600, solana: 140, binance: 380, cardano: 0.70 },
    { date: "March", bitcoin: 52000, ethereum: 2900, solana: 180, binance: 420, cardano: 0.90 },
    { date: "April", bitcoin: 55000, ethereum: 3200, solana: 220, binance: 460, cardano: 1.10 },
    { date: "May", bitcoin: 60000, ethereum: 3500, solana: 260, binance: 500, cardano: 1.30 },
    { date: "June", bitcoin: 65000, ethereum: 3800, solana: 300, binance: 540, cardano: 1.50 },
  ]
}

// Cryptocurrency configuration
const cryptoConfig = {
  bitcoin: {
    label: "Bitcoin",
    icon: Bitcoin,
    color: "#F7931A",
  },
  ethereum: {
    label: "Ethereum",
    icon: FaEthereum,
    color: "#627EEA",
  },
  solana: {
    label: "Solana",
    icon: SiSolana,
    color: "#00FFA3",
  },
  binance: {
    label: "Binance Coin",
    icon: SiBinance,
    color: "#F0B90B",
  },
  cardano: {
    label: "Cardano",
    icon: SiCardano,
    color: "#0033A0",
  }
} satisfies ChartConfig

export default function LineChartAnalytics() {
  const [timeframe, setTimeframe] = React.useState("weekly")
  const [selectedCrypto, setSelectedCrypto] = React.useState("bitcoin")

  const currentData = cryptoData[timeframe]

  return (
    <div className='w-[90%] mx-auto h-full bg-zinc-950'>
      <div className='w-[100%] h-full flex flex-col'>
        <div className='w-[100%] h-20 bg-zinc-900 flex items-end px-10 py-3 space-x-4'>
          <div className='text-5xl text-white mr-5'>Crypto Trends</div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Timeframe: {timeframe}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Timeframe</DropdownMenuLabel>
              <DropdownMenuSeparator/>
              <DropdownMenuRadioGroup 
                value={timeframe} 
                onValueChange={setTimeframe}
              >
                <DropdownMenuRadioItem value="daily">Daily</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="weekly">Weekly</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthly">Monthly</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                {React.createElement(cryptoConfig[selectedCrypto].icon, { 
                  className: "w-5 h-5 mr-2",
                  color: cryptoConfig[selectedCrypto].color
                })}
                {cryptoConfig[selectedCrypto].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Cryptocurrencies</DropdownMenuLabel>
              <DropdownMenuSeparator/>
              <DropdownMenuRadioGroup 
                value={selectedCrypto} 
                onValueChange={setSelectedCrypto}
              >
                {Object.keys(cryptoConfig).map((crypto) => (
                  <DropdownMenuRadioItem key={crypto} value={crypto}>
                    <div className="flex items-center">
                      {React.createElement(cryptoConfig[crypto].icon, { 
                        className: "w-5 h-5 mr-2",
                        color: cryptoConfig[crypto].color
                      })}
                      {cryptoConfig[crypto].label}
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='w-[100%] h-[50vh] bg-zinc-900 flex items-end justify-start'>
          <ChartContainer config={cryptoConfig} className="h-full w-full px-4 py-4">
            <LineChart
              accessibilityLayer
              data={currentData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={true}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={true}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Line
                dataKey={selectedCrypto}
                type="natural"
                stroke={cryptoConfig[selectedCrypto].color}
                strokeWidth={2}
                dot={{
                  fill: cryptoConfig[selectedCrypto].color,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

