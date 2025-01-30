
export const CHAIN_MAPPING = {
  1: 'ethereum',
  137: 'polygon',
  56: 'binance', 
  43114: 'avalanche',
  10: 'optimism'
};


export const SUPPORTED_CHAINS = [
  'ethereum',
  'polygon',
  'binance',
  'avalanche',
  'optimism'
];


export function getChainName(chainId) {
  const chainName = CHAIN_MAPPING[chainId];
  if (!chainName || !SUPPORTED_CHAINS.includes(chainName)) {
    return 'ethereum'; 
  }
  return chainName;
}
