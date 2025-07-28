import { useState, useEffect } from "react";
import { useFilteredData } from "@/hooks/useFilteredData";
import { FinancialCard } from "@/components/ui/financial-card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/lib/supabaseClient";

interface Debt {
  id: string;
  title: string;
  creditor: string;
  amount: number;
  currency: string;
  dueDate: string | null;
  status: string;
  type: string;
  date: string;
  debt_amount_history: DebtAmountHistory[];
}

interface DebtAmountHistory {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  note: string;
  logged_at: string;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState("short");
  const [isEditingDebt, setIsEditingDebt] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const { formatCurrency, currency } = useCurrency();
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [newDebt, setNewDebt] = useState({
    title: '',
    creditor: '',
    amount: '',
    currency: 'USD',
    dueDate: '',
    status: 'pending',
    type: 'short'
  });

  const handleAddDebt = async () => {
    const payload = {
      ...newDebt,
      amount: parseFloat(String(newDebt.amount)),
    };
    const { data, error } = await supabase
      .from('debts')
      .insert([payload])
      .select();
    if (error) {
      console.error('Error adding debt:', error);
    } else if (data) {
      setDebts([...debts, data[0]]);
      setIsAddingDebt(false);
      setNewDebt({
        title: '',
        creditor: '',
        amount: '',
        currency: 'USD',
        dueDate: '',
        status: 'pending',
        type: 'short'
      });
    }
  };

  useEffect(() => {
    const fetchDebts = async () => {
      const { data, error } = await supabase.from('debts').select('*, debt_amount_history(*)');
      if (error) {
        console.error('Error fetching debts:', error);
      } else if (data) {
        setDebts(data);
      }
    };

    fetchDebts();
  }, []);

  // Filter debts by selected month
  const filteredDebtsByMonth = useFilteredData(debts);

  const shortTermDebts = filteredDebtsByMonth.filter(debt => debt.type === "short");
  const longTermDebts = filteredDebtsByMonth.filter(debt => debt.type === "long");
  
  const totalShortTerm = shortTermDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalLongTerm = longTermDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPending = filteredDebtsByMonth.filter(debt => debt.status === "pending").reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = filteredDebtsByMonth.filter(debt => debt.status === "paid").reduce((sum, debt) => sum + debt.amount, 0);

  const filteredDebts = activeTab === "short" ? shortTermDebts : longTermDebts;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No fixed date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const [editFormData, setEditFormData] = useState({
    title: '',
    creditor: '',
    amount: 0,
    dueDate: '',
    status: '',
    currency: '',
  });

  const handleEditClick = (debt: Debt) => {
    setEditingDebt(debt);
    setEditFormData({
      title: debt.title,
      creditor: debt.creditor,
      amount: debt.amount,
      dueDate: debt.dueDate || '',
      status: debt.status,
      currency: debt.currency,
    });
    setIsEditingDebt(true);
  };

  const handleDeleteClick = (debt: Debt) => {
    setDeletingDebt(debt);
  };

  const handleDelete = async () => {
    if (!deletingDebt) return;
    await supabase.from('debts').delete().match({ id: deletingDebt.id });
    setDebts(debts.filter(debt => debt.id !== deletingDebt.id));
    setDeletingDebt(null);
  };

  const [note, setNote] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDebt) return;

    const payload = {
      ...editFormData,
      amount: parseFloat(String(editFormData.amount)),
    };

    const { error } = await supabase
      .from('debts')
      .update(payload)
      .match({ id: editingDebt.id });

    if (error) {
      console.error('Error updating debt:', error);
      return;
    }

    setDebts(debts.map(debt => (debt.id === editingDebt.id ? { ...debt, ...editFormData } : debt)));
    setIsEditingDebt(false);
    setEditingDebt(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Debt Management</h1>
          <p className="text-muted-foreground">
            Track and manage your short-term and long-term debts
          </p>
        </div>
        <Dialog open={isAddingDebt} onOpenChange={setIsAddingDebt}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">Add Debt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
              <DialogDescription>
                Record a new debt to track your liabilities
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Credit Card" value={newDebt.title} onChange={(e) => setNewDebt({ ...newDebt, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="creditor">Creditor</Label>
                <Input id="creditor" placeholder="e.g., Bank" value={newDebt.creditor} onChange={(e) => setNewDebt({ ...newDebt, creditor: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.00" value={newDebt.amount} onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newDebt.currency} onValueChange={(value) => setNewDebt({ ...newDebt, currency: value })}>
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={newDebt.dueDate} onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newDebt.type} onValueChange={(value) => setNewDebt({ ...newDebt, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short-Term</SelectItem>
                    <SelectItem value="long">Long-Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingDebt(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary" onClick={handleAddDebt}>
                  Add Debt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          variant="debt"
          title="Short-Term Debt"
          value={formatCurrency(totalShortTerm)}
          subtitle="Due within 60 days"
          icon={<CreditCard className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="asset"
          title="Long-Term Debt"
          value={formatCurrency(totalLongTerm)}
          subtitle="Extended payment terms"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="expense"
          title="Total Pending"
          value={formatCurrency(totalPending)}
          subtitle="Awaiting payment"
          icon={<Clock className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="income"
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle="Completed payments"
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Debt Overview */}
      <div className="bg-gradient-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Debt Overview</h2>
          <p className="text-muted-foreground">View and manage all your debts</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-fit grid-cols-2 bg-[#E9F4F4] dark:bg-muted">
              <TabsTrigger 
                value="short" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#0C1439] data-[state=active]:font-semibold data-[state=active]:shadow"
              >
                Short-Term Debt
              </TabsTrigger>
              <TabsTrigger 
                value="long"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0C1439] data-[state=active]:font-semibold data-[state=active]:shadow"
              >
                Long-Term Debt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="short" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Title</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Creditor</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Due Date</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">History</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt) => (
                    <TableRow key={debt.id} className="hover:bg-muted/50">
                      <TableCell className="text-base font-medium text-[#0C1439] dark:text-foreground">
                        {debt.title}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {debt.creditor}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {formatDate(debt.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-600 text-sm rounded-full px-3 py-1">
                          {debt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base font-medium text-[#0C1439] dark:text-foreground">
                        {formatCurrency(debt.amount)}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">View History</Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Amount History</h4>
                              <ul className="space-y-1">
                                {debt.debt_amount_history.map(history => (
                                  <li key={history.id} className="text-sm">
                                    {formatCurrency(history.amount)} on {formatDate(history.logged_at)}
                                    {history.note && <p className="text-xs text-muted-foreground">{history.note}</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleEditClick(debt)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleDeleteClick(debt)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the debt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingDebt(null)}>Cancel</AlertDialogCancel>
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

            <TabsContent value="long" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Title</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Creditor</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Due Date</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">History</TableHead>
                    <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt) => (
                    <TableRow key={debt.id} className="hover:bg-muted/50">
                      <TableCell className="text-base font-medium text-[#0C1439] dark:text-foreground">
                        {debt.title}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {debt.creditor}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {formatDate(debt.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-600 text-sm rounded-full px-3 py-1">
                          {debt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base font-medium text-[#0C1439] dark:text-foreground">
                        {formatCurrency(debt.amount)}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">View History</Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Amount History</h4>
                              <ul className="space-y-1">
                                {debt.debt_amount_history.map(history => (
                                  <li key={history.id} className="text-sm">
                                    {formatCurrency(history.amount)} on {formatDate(history.logged_at)}
                                    {history.note && <p className="text-xs text-muted-foreground">{history.note}</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleEditClick(debt)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => handleDeleteClick(debt)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the debt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingDebt(null)}>Cancel</AlertDialogCancel>
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
      {editingDebt && (
        <Dialog open={isEditingDebt} onOpenChange={setIsEditingDebt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Debt</DialogTitle>
              <DialogDescription>
                Update the details of your debt.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input name="title" value={editFormData.title} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="creditor">Creditor</Label>
                  <Input name="creditor" value={editFormData.creditor} onChange={handleInputChange} />
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
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input name="dueDate" type="date" value={editFormData.dueDate} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" value={editFormData.status} onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditingDebt(false)}>
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