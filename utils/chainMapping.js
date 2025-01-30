// Chain mapping needs to match the API's expected values
export const CHAIN_MAPPING = {
  1: 'ethereum',
  137: 'polygon',
  56: 'binance',  // Changed from binance to binance-smart-chain
  43114: 'avalanche',
  10: 'optimism'
};

// API supported chains
export const SUPPORTED_CHAINS = [
  'ethereum',
  'polygon',
  'binance',
  'avalanche',
  'optimism'
];

// Helper function to validate and get chain name
export function getChainName(chainId) {
  const chainName = CHAIN_MAPPING[chainId];
  if (!chainName || !SUPPORTED_CHAINS.includes(chainName)) {
    return 'ethereum'; // Default to ethereum if unsupported
  }
  return chainName;
}
