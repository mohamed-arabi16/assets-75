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

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial health and current balance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <FinancialCard
          variant="balance"
          title="Available Balance"
          value={formatCurrency(12450)}
          subtitle="Ready to spend"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{
            value: "+8.2%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="income"
          title="Expected Income"
          value={formatCurrency(8500)}
          subtitle="Next 30 days"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: "+12.4%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="expense"
          title="Monthly Expenses"
          value={formatCurrency(3200)}
          subtitle="Recurring + one-time"
          icon={<TrendingDown className="h-5 w-5" />}
          trend={{
            value: "-2.1%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="debt"
          title="Short-term Debt"
          value={formatCurrency(1800)}
          subtitle="Due within 60 days"
          icon={<CreditCard className="h-5 w-5" />}
          trend={{
            value: "-15.3%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="asset"
          title="Asset Value"
          value={formatCurrency(45200)}
          subtitle="Silver, crypto, etc."
          icon={<Gem className="h-5 w-5" />}
          trend={{
            value: "+3.7%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          title="Net Worth"
          value={formatCurrency(55850)}
          subtitle="Total assets - debts"
          icon={<Calendar className="h-5 w-5" />}
          trend={{
            value: "+5.1%",
            isPositive: true
          }}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
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
            <div className="flex items-center justify-between p-3 rounded-lg bg-income/10">
              <div>
                <div className="font-medium">Freelance Project</div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
              <div className="text-income font-semibold">{formatCurrency(1200)}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-expense/10">
              <div>
                <div className="font-medium">Office Supplies</div>
                <div className="text-sm text-muted-foreground">Yesterday</div>
              </div>
              <div className="text-expense font-semibold">-{formatCurrency(85)}</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-debt/10">
              <div>
                <div className="font-medium">Credit Card Payment</div>
                <div className="text-sm text-muted-foreground">3 days ago</div>
              </div>
              <div className="text-debt font-semibold">-{formatCurrency(500)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}