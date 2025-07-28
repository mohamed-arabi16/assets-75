import { useState } from "react";
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
  id: number;
  title: string;
  creditor: string;
  amount: number;
  currency: string;
  dueDate: string | null;
  status: string;
  type: string;
  date: string;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState("short");
  const [isEditingDebt, setIsEditingDebt] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchDebts = async () => {
      const { data, error } = await supabase.from('debts').select('*');
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

  const handleEditClick = (debt: Debt) => {
    setEditingDebt(debt);
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

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDebt) return;

    const formData = new FormData(e.currentTarget);
    const updatedDebt = {
      ...editingDebt,
      title: formData.get('title') as string,
      creditor: formData.get('creditor') as string,
      amount: Number(formData.get('amount')),
      dueDate: formData.get('dueDate') as string,
    };

    await supabase.from('debts').update(updatedDebt).match({ id: editingDebt.id });
    setDebts(debts.map(debt => (debt.id === editingDebt.id ? updatedDebt : debt)));
    setIsEditingDebt(false);
    setEditingDebt(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Debt Management</h1>
        <p className="text-muted-foreground">
          Track and manage your short-term and long-term debts
        </p>
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
                  <Input name="title" defaultValue={editingDebt.title} />
                </div>
                <div>
                  <Label htmlFor="creditor">Creditor</Label>
                  <Input name="creditor" defaultValue={editingDebt.creditor} />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input name="amount" type="number" step="0.01" defaultValue={editingDebt.amount} />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input name="dueDate" type="date" defaultValue={editingDebt.dueDate || ''} />
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