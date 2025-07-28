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
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

// Mock data with dates for filtering (using creation/record date)
const mockDebts = [
  {
    id: 1,
    title: "Phone Installment",
    creditor: "Phone Company", 
    amount: 1150,
    currency: "USD",
    dueDate: "2025-06-30",
    status: "pending",
    type: "short",
    date: "2025-01-10" // When debt was recorded
  },
  {
    id: 2,
    title: "Credit Card",
    creditor: "Bank ABC",
    amount: 2500,
    currency: "USD", 
    dueDate: "2025-02-15",
    status: "pending",
    type: "short",
    date: "2025-01-05"
  },
  {
    id: 3,
    title: "Student Loan",
    creditor: "Education Finance",
    amount: 25000,
    currency: "USD",
    dueDate: null,
    status: "pending", 
    type: "long",
    date: "2025-01-01"
  },
  {
    id: 4,
    title: "Car Loan",
    creditor: "Auto Finance",
    amount: 18000,
    currency: "USD",
    dueDate: null,
    status: "pending",
    type: "long",
    date: "2024-12-15" // Previous month
  },
  {
    id: 5,
    title: "Personal Loan",
    creditor: "Bank XYZ",
    amount: 5000,
    currency: "USD",
    dueDate: "2025-03-01",
    status: "pending",
    type: "short",
    date: "2024-11-20" // November
  }
];

export default function Debts() {
  const [debts, setDebts] = useState(mockDebts);
  const [activeTab, setActiveTab] = useState("short");
  const { formatCurrency } = useCurrency();

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
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => console.log('edit clicked')}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => console.log('delete clicked')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => console.log('edit clicked')}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={() => console.log('delete clicked')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}