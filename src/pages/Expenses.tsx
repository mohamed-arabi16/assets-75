import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  Home, 
  Car, 
  Calendar,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFilteredData, useMonthlyStats } from "@/hooks/useFilteredData";
import { supabase } from "@/lib/supabaseClient";

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  type: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState("fixed");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const { formatCurrency } = useCurrency();

  // Filter expenses by selected month
  const filteredExpensesByMonth = useFilteredData(expenses);
  
  const fixedExpenses = filteredExpensesByMonth.filter(expense => expense.type === "fixed");
  const variableExpenses = filteredExpensesByMonth.filter(expense => expense.type === "variable");
  
  const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalVariable = variableExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = filteredExpensesByMonth.filter(expense => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = filteredExpensesByMonth.filter(expense => expense.status === "pending").reduce((sum, expense) => sum + expense.amount, 0);

  const filteredExpenses = activeTab === "fixed" ? fixedExpenses : variableExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600";
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditingExpense(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;
    await supabase.from('expenses').delete().match({ id: deletingExpense.id });
    setExpenses(expenses.filter(expense => expense.id !== deletingExpense.id));
    setDeletingExpense(null);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExpense) return;

    const formData = new FormData(e.currentTarget);
    const updatedExpense = {
      ...editingExpense,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
    };

    await supabase.from('expenses').update(updatedExpense).match({ id: editingExpense.id });
    setExpenses(expenses.map(expense => (expense.id === editingExpense.id ? updatedExpense : expense)));
    setIsEditingExpense(false);
    setEditingExpense(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
          <p className="text-muted-foreground">
            Track and manage your fixed and variable expenses
          </p>
        </div>
        
        <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Record a new expense to track your spending
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Office Rent" />
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
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary">
                  Add Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          variant="expense"
          title="Fixed Expenses"
          value={formatCurrency(totalFixed)}
          subtitle="Monthly recurring"
          icon={<Home className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="debt"
          title="Variable Expenses"
          value={formatCurrency(totalVariable)}
          subtitle="Fluctuating costs"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="income"
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle="Completed payments"
          icon={<Calendar className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="asset"
          title="Total Pending"
          value={formatCurrency(totalPending)}
          subtitle="Awaiting payment"
          icon={<Car className="h-5 w-5" />}
        />
      </div>

      {/* Expense Overview */}
      <div className="bg-gradient-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Expense Overview</h2>
          <p className="text-muted-foreground">View and manage all your expenses</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-fit grid-cols-2 bg-[#E9F4F4] dark:bg-muted">
              <TabsTrigger 
                value="fixed" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#0C1439] data-[state=active]:font-semibold data-[state=active]:shadow"
              >
                Fixed Expenses
              </TabsTrigger>
              <TabsTrigger 
                value="variable"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0C1439] data-[state=active]:font-semibold data-[state=active]:shadow"
              >
                Variable Expenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fixed" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Title</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Category</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Date</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell className="text-base font-medium text-[#0C1439] dark:text-foreground">
                        {expense.title}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(expense.status)} text-sm rounded-full px-3 py-1`}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base font-medium text-[#0C1439] dark:text-foreground">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleEditClick(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleDeleteClick(expense)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the expense.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingExpense(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="variable" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Title</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Category</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Date</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell className="text-base font-medium text-[#0C1439] dark:text-foreground">
                        {expense.title}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(expense.status)} text-sm rounded-full px-3 py-1`}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base font-medium text-[#0C1439] dark:text-foreground">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleEditClick(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleDeleteClick(expense)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the expense.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingExpense(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {editingExpense && (
        <Dialog open={isEditingExpense} onOpenChange={setIsEditingExpense}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>
                Update the details of your expense.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input name="title" defaultValue={editingExpense.title} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input name="category" defaultValue={editingExpense.category} />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input name="amount" type="number" step="0.01" defaultValue={editingExpense.amount} />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input name="date" type="date" defaultValue={editingExpense.date} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditingExpense(false)}>
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