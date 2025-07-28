import { useState, useEffect } from "react";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { useFilteredData } from "@/hooks/useFilteredData";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Edit, Trash2, Filter } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Income {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  date: string;
}

export default function Income() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [filter, setFilter] = useState("all");
  const { formatCurrency, currency } = useCurrency();
  const [newIncome, setNewIncome] = useState({
    title: '',
    amount: '',
    currency: 'USD',
    category: '',
    status: '',
    date: '',
  });

  const handleAddIncome = async () => {
    const payload = {
      ...newIncome,
      amount: parseFloat(newIncome.amount as unknown as string),
    } as unknown as Omit<Income, "id">;
    const { data, error } = await supabase
      .from('incomes')
      .insert([payload])
      .select();
    if (error) {
      console.error('Error adding income:', error);
    } else if (data) {
      setIncomes([...incomes, data[0]]);
      setIsAddingIncome(false);
      setNewIncome({
        title: '',
        amount: '',
        currency: 'USD',
        category: '',
        status: '',
        date: '',
      });
    }
  };

  useEffect(() => {
    const fetchIncomes = async () => {
      const { data, error } = await supabase.from('incomes').select('*');
      if (error) {
        console.error('Error fetching incomes:', error);
      } else if (data) {
        setIncomes(data);
      }
    };

    fetchIncomes();
  }, []);

  // Filter incomes by selected month
  const filteredIncomesByMonth = useFilteredData(incomes);

  const getStatusColor = (status: string) => {
    return status === "received" ? "bg-income" : "bg-orange-500";
  };

  const getCategoryIcon = (category: string) => {
    return <TrendingUp className="h-4 w-4" />;
  };

  const filteredIncomes = filteredIncomesByMonth.filter(income => {
    if (filter === "all") return true;
    return income.status === filter;
  });

  const totalExpected = filteredIncomesByMonth
    .filter(i => i.status === "expected")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalReceived = filteredIncomesByMonth
    .filter(i => i.status === "received") 
    .reduce((sum, i) => sum + i.amount, 0);

  // Calculate income by category for filtered month
  const incomeByCategory = filteredIncomesByMonth.reduce((acc, income) => {
    const category = income.category;
    acc[category] = (acc[category] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: 0,
    category: '',
    status: '',
    date: '',
    currency: '',
  });

  const handleEditClick = (income: Income) => {
    setEditingIncome(income);
    setEditFormData({
      title: income.title,
      amount: income.amount,
      category: income.category,
      status: income.status,
      date: income.date,
      currency: income.currency,
    });
    setIsEditingIncome(true);
  };

  const handleDeleteClick = (income: Income) => {
    setDeletingIncome(income);
  };

  const handleDelete = async () => {
    if (!deletingIncome) return;
    await supabase.from('incomes').delete().match({ id: deletingIncome.id });
    setIncomes(incomes.filter(income => income.id !== deletingIncome.id));
    setDeletingIncome(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingIncome) return;

    const payload = {
      ...editFormData,
      amount: parseFloat(String(editFormData.amount)),
    };

    const { data, error } = await supabase
      .from('incomes')
      .update(payload)
      .match({ id: editingIncome.id })
      .select();

    if (error) {
      console.error('Error updating income:', error);
      return;
    }

    setIncomes(incomes.map(income => (income.id === editingIncome.id ? data[0] : income)));
    setIsEditingIncome(false);
    setEditingIncome(null);
  };

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
                <Input id="title" placeholder="e.g., Freelance Project" value={newIncome.title} onChange={(e) => setNewIncome({ ...newIncome, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.00" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newIncome.currency} onValueChange={(value) => setNewIncome({ ...newIncome, currency: value })}>
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
                <Select value={newIncome.category} onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}>
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
                <Select value={newIncome.status} onValueChange={(value) => setNewIncome({ ...newIncome, status: value })}>
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
                <Input id="date" type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingIncome(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary" onClick={handleAddIncome}>
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditClick(income)}>
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteClick(income)}>
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the income.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingIncome(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingIncome && (
        <Dialog open={isEditingIncome} onOpenChange={setIsEditingIncome}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income</DialogTitle>
              <DialogDescription>
                Update the details of your income.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input name="title" value={editFormData.title} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input name="amount" type="number" step="0.01" value={editFormData.amount} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" value={editFormData.currency} onValueChange={(value) => handleInputChange({ target: { name: 'currency', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="TRY">TRY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input name="category" value={editFormData.category} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" value={editFormData.status} onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expected">Expected</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input name="date" type="date" value={editFormData.date} onChange={handleInputChange} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditingIncome(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}