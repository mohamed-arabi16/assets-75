import { Suspense, useEffect, useState } from "react";
import { FinancialCard } from "@/components/ui/financial-card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Gem,
  Calendar
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useDate } from "@/contexts/DateContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const { selectedMonth, isCurrentMonth } = useDate();
  const { user } = useAuth();

  const [data, setData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    debt: 0,
    assets: 0,
    netWorth: 0,
    recentActivity: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: incomes } = await supabase
        .from("incomes")
        .select("amount")
        .eq("user_id", user.id);

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id);

      const { data: debts } = await supabase
        .from("debts")
        .select("amount")
        .eq("user_id", user.id);

      const { data: assets } = await supabase
        .from("assets")
        .select("total_value")
        .eq("user_id", user.id);

      const totalIncome = incomes?.reduce((acc, i) => acc + i.amount, 0) || 0;
      const totalExpenses = expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;
      const totalDebt = debts?.reduce((acc, d) => acc + d.amount, 0) || 0;
      const totalAssets = assets?.reduce((acc, a) => acc + a.total_value, 0) || 0;

      setData({
        balance: totalIncome - totalExpenses,
        income: totalIncome,
        expenses: totalExpenses,
        debt: totalDebt,
        assets: totalAssets,
        netWorth: totalAssets - totalDebt,
        recentActivity: [],
      });
    };

    fetchData();
  }, [user, selectedMonth]);

  const getSubtitle = () => {
    if (selectedMonth === 'all') {
      return 'Financial overview for all dates';
    }
    if (isCurrentMonth()) {
      return 'Overview of your financial health and current balance';
    }
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    return `Financial overview for ${monthName}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">
          {getSubtitle()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Suspense fallback={<Skeleton className="h-32" />}>
          <FinancialCard
            variant="balance"
            title="Available Balance"
            value={formatCurrency(data.balance)}
            subtitle="Ready to spend"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-32" />}>
          <FinancialCard
            variant="income"
            title="Expected Income"
            value={formatCurrency(data.income)}
            subtitle="Next 30 days"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-32" />}>
          <FinancialCard
            variant="expense"
            title="Monthly Expenses"
            value={formatCurrency(data.expenses)}
            subtitle="Recurring + one-time"
            icon={<TrendingDown className="h-5 w-5" />}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-32" />}>
          <FinancialCard
            variant="debt"
            title="Short-term Debt"
            value={formatCurrency(data.debt)}
            subtitle="Due within 60 days"
            icon={<CreditCard className="h-5 w-5" />}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-32" />}>
          <FinancialCard
            variant="asset"
            title="Asset Value"
            value={formatCurrency(data.assets)}
            subtitle="Silver, crypto, etc."
            icon={<Gem className="h-5 w-5" />}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-32" />}>
          <FinancialCard
            title="Net Worth"
            value={formatCurrency(data.netWorth)}
            subtitle="Total assets - debts"
            icon={<Calendar className="h-5 w-5" />}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-card rounded-lg p-4 sm:p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <div className="font-medium">Add Income</div>
              <div className="text-sm text-muted-foreground">Record a new payment received</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors">
              <div className="font-medium">Add Expense</div>
              <div className="text-sm text-muted-foreground">Log a new expense</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors">
              <div className="font-medium">Update Debt</div>
              <div className="text-sm text-muted-foreground">Manage your debts</div>
            </button>
          </div>
        </div>

        <div className="bg-gradient-card rounded-lg p-4 sm:p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {/* Recent activity will be populated from data */}
          </div>
        </div>
      </div>
    </div>
  );
}