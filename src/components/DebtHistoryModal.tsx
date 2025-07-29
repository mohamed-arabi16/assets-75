import { useCurrency } from "@/contexts/CurrencyContext";
import { Debt, DebtAmountHistory } from "@/hooks/useDebts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DebtHistoryModalProps {
  debt: Debt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DebtHistoryModal({ debt, isOpen, onClose }: DebtHistoryModalProps) {
  const { formatCurrency } = useCurrency();

  if (!debt) return null;

  const history = debt.debt_amount_history
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map((entry, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1].amount : 0; // Start with 0 for the first entry
      const delta = entry.amount - prev;
      return { ...entry, prev_amount: prev, delta };
    });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Debt History: {debt.title}</DialogTitle>
          <DialogDescription>
            A detailed log of all changes to this debt's amount.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Previous Amount</TableHead>
                <TableHead>New Amount</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.logged_at)}</TableCell>
                  <TableCell>{index > 0 ? formatCurrency(entry.prev_amount, debt.currency) : 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(entry.amount, debt.currency)}</TableCell>
                  <TableCell>
                    {entry.delta !== null && index > 0 ? (
                      <Badge variant={entry.delta > 0 ? "destructive" : "default"} className={entry.delta > 0 ? 'bg-red-500' : 'bg-green-500'}>
                        {entry.delta > 0 ? 'Increase' : 'Payment'}: {formatCurrency(Math.abs(entry.delta), debt.currency)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Initial Amount: {formatCurrency(entry.amount, debt.currency)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{entry.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
