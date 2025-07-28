import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'TRY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, fromCurrency?: Currency) => string;
  convertCurrency: (amount: number, fromCurrency: Currency) => number;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data.rates && data.rates.TRY) {
          setExchangeRate(data.rates.TRY);
        } else {
          throw new Error('TRY exchange rate not found in API response');
        }
      } catch (error: any) {
        console.error('Failed to fetch exchange rate:', error.message);
        setError('Failed to fetch exchange rate. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();

    const interval = setInterval(fetchExchangeRate, 60000); // Fetches every minute
    
    return () => clearInterval(interval);
  }, []);

  const convertCurrency = (amount: number, fromCurrency: Currency): number => {
    if (fromCurrency === currency) return amount;
    
    if (fromCurrency === 'USD' && currency === 'TRY') {
      return amount * exchangeRate;
    } else if (fromCurrency === 'TRY' && currency === 'USD') {
      return amount / exchangeRate;
    }
    
    return amount;
  };

  const formatCurrency = (amount: number, fromCurrency: Currency = 'USD'): string => {
    const convertedAmount = convertCurrency(amount, fromCurrency);
    
    if (currency === 'USD') {
      return `$${convertedAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })}`;
    } else {
      return `₺${convertedAmount.toLocaleString('tr-TR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatCurrency, 
      convertCurrency, 
      exchangeRate 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};