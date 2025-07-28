import { useMemo } from 'react';
import { useDate } from '@/contexts/DateContext';

interface DateFilterableItem {
  date: string;
  [key: string]: any;
}

export const useFilteredData = <T extends DateFilterableItem>(data: T[]) => {
  const { selectedMonth } = useDate();

  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;

    const [year, month] = selectedMonth.split('-');
    return data.filter(item => {
      const itemDate = new Date(item.date);
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
      
      return itemYear === year && itemMonth === month;
    });
  }, [data, selectedMonth]);

  return filteredData;
};

export const useMonthlyStats = <T extends DateFilterableItem & { amount: number }>(
  data: T[], 
  filterFn?: (item: T) => boolean
) => {
  const { selectedMonth } = useDate();

  const stats = useMemo(() => {
    let filteredData = data;
    
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        const itemYear = itemDate.getFullYear().toString();
        const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
        
        return itemYear === year && itemMonth === month;
      });
    }

    if (filterFn) {
      filteredData = filteredData.filter(filterFn);
    }

    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const count = filteredData.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average, items: filteredData };
  }, [data, selectedMonth, filterFn]);

  return stats;
};