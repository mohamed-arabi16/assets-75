import { useState } from "react";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { FinancialCard } from "@/components/ui/financial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Edit, Trash2, Filter } from "lucide-react";

// Mock data
const mockIncomes = [
  {
    id: 1,
    title: "Freelance Web Design",
    amount: 2500,
    currency: "USD",
    category: "freelance",
    status: "received",
    date: "2024-01-15"
  },
  {
    id: 2,
    title: "Student Commission",
    amount: 800,
    currency: "USD", 
    category: "commission",
    status: "expected",
    date: "2024-01-28"
  },
  {
    id: 3,
    title: "Rental Income",
    amount: 15000,
    currency: "TRY",
    category: "rent",
    status: "received",
    date: "2024-01-01"
  }
];

export default function Income() {
  const [incomes, setIncomes] = useState(mockIncomes);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [filter, setFilter] = useState("all");
  const { formatCurrency } = useCurrency();

  const getStatusColor = (status: string) => {
    return status === "received" ? "bg-income" : "bg-orange-500";
  };

  const getCategoryIcon = (category: string) => {
    return <TrendingUp className="h-4 w-4" />;
  };

  const filteredIncomes = incomes.filter(income => {
    if (filter === "all") return true;
    return income.status === filter;
  });

  const totalExpected = incomes
    .filter(i => i.status === "expected")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalReceived = incomes
    .filter(i => i.status === "received") 
    .reduce((sum, i) => sum + i.amount, 0);

  // Calculate income by category
  const incomeByCategory = incomes.reduce((acc, income) => {
    const category = income.category;
    acc[category] = (acc[category] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Income Tracking</h1>
          <p className="text-muted-foreground">
            Manage your freelance income and expected payments
          </p>
        </div>
        
        <Dialog open={isAddingIncome} onOpenChange={setIsAddingIncome}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-financial w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Income</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
              <DialogDescription>
                Record a new income entry to track your earnings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Freelance Project" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="TRY">TRY (₺)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expected">Expected</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingIncome(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary">
                  Add Income
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <FinancialCard
          variant="income"
          title="Total Received"
          value={formatCurrency(totalReceived, 'USD')}
          subtitle="This month"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: "+8.2%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="default"
          title="Expected"
          value={formatCurrency(totalExpected, 'USD')}
          subtitle="Next 30-60 days"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="default"
          title="Total Income"
          value={formatCurrency(totalReceived + totalExpected, 'USD')}
          subtitle="Combined total"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Income by Category */}
      <div className="bg-gradient-card rounded-lg border border-border shadow-card">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Total Income by Category</h2>
          <p className="text-muted-foreground">Breakdown of income sources</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(incomeByCategory).map(([category, amount]) => (
              <div key={category} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-income" />
                  <span className="text-sm font-medium capitalize">{category}</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(amount, 'USD')}</div>
                <div className="text-sm text-muted-foreground">
                  {((amount / (totalReceived + totalExpected)) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Income List */}
      <div className="bg-gradient-card rounded-lg border border-border shadow-card">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Income History</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="expected">Expected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {filteredIncomes.map((income) => (
            <div key={income.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-income/10 rounded-lg flex-shrink-0">
                    {getCategoryIcon(income.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">{income.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(income.date).toLocaleDateString()} • {income.category}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-left sm:text-right">
                    <div className="font-semibold text-sm sm:text-base">
                      {formatCurrency(income.amount, income.currency as Currency)}
                    </div>
                    <Badge 
                      className={`${getStatusColor(income.status)} text-white text-xs`}
                    >
                      {income.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}