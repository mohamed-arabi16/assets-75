import { useState, useEffect } from 'react';

interface CommodityPrices {
  gold: number;
  silver: number;
  error?: string;
}

export const useCommodityPrices = () => {
  const [prices, setPrices] = useState<CommodityPrices>({
    gold: 0,
    silver: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.metals.dev/v1/spot');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const goldData = data.find(item => item.metal === 'gold');
          const silverData = data.find(item => item.metal === 'silver');

          if (!goldData || !silverData) {
            throw new Error('Gold or silver data not found in API response');
          }
          
          const goldPerGram = goldData.price / 31.1035;
          const silverPerGram = silverData.price / 31.1035;
          
          setPrices({
            gold: goldPerGram,
            silver: silverPerGram,
          });
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to fetch commodity prices:', error.message);
          setPrices({
            gold: 0,
            silver: 0,
            error: 'Failed to fetch prices. Please try again later.',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    
    const interval = setInterval(fetchPrices, 60000); // Fetches every minute
    
    return () => clearInterval(interval);
  }, []);

  return { prices, loading };
};