import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  buildTransactions,
  generateDeals,
  generateExpenses,
  generateInvoices,
  upcomingBills,
} from '@/data/generate';
import {
  employees,
  generateProducts,
  generatePurchaseOrders,
  payrollRuns,
  type PayrollRun,
  type Product,
  type PurchaseOrder,
} from '@/data/operations';
import type { Bill, Deal, DealStage, Invoice, Transaction } from '@/data/types';
import { generateTasks, type Task, type TaskStatus } from '@/data/demos';
import { TODAY } from '@/lib/date';

/**
 * In-memory data store for the demo. Swap the initial generators for API
 * fetches (React Query, SWR, etc.) and keep the same shape — pages only
 * talk to `useData()`.
 */
interface DataContextValue {
  invoices: Invoice[];
  transactions: Transaction[];
  expenses: Transaction[];
  deals: Deal[];
  bills: Bill[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  payroll: PayrollRun[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => Invoice;
  markInvoicePaid: (id: string) => void;
  moveDeal: (id: string, stage: DealStage) => void;
  /** Marks a PO received and adds its quantities to stock. */
  receivePurchaseOrder: (id: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  nextInvoiceNumber: string;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(generateInvoices);
  const [deals, setDeals] = useState<Deal[]>(generateDeals);
  const [products, setProducts] = useState<Product[]>(generateProducts);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => generatePurchaseOrders(generateProducts()));
  const [tasks, setTasks] = useState<Task[]>(generateTasks);
  const expenses = useMemo(generateExpenses, []);
  const transactions = useMemo(() => buildTransactions(invoices, expenses), [invoices, expenses]);
  const bills = useMemo(() => upcomingBills(expenses, employees.length), [expenses]);
  const payroll = useMemo(() => payrollRuns(transactions), [transactions]);

  const nextNumber = useMemo(() => {
    const max = invoices.reduce((m, inv) => Math.max(m, Number(inv.number.replace(/\D/g, '')) || 0), 1000);
    return max + 1;
  }, [invoices]);

  const addInvoice = useCallback(
    (data: Omit<Invoice, 'id' | 'number'>) => {
      const invoice: Invoice = { ...data, id: `inv-${nextNumber}`, number: `INV-${nextNumber}` };
      setInvoices((list) => [invoice, ...list]);
      return invoice;
    },
    [nextNumber],
  );

  const markInvoicePaid = useCallback((id: string) => {
    setInvoices((list) => list.map((inv) => (inv.id === id ? { ...inv, status: 'paid', paidDate: TODAY } : inv)));
  }, []);

  const moveDeal = useCallback((id: string, stage: DealStage) => {
    setDeals((list) => list.map((d) => (d.id === id ? { ...d, stage } : d)));
  }, []);

  const receivePurchaseOrder = useCallback(
    (id: string) => {
      const po = purchaseOrders.find((p) => p.id === id);
      if (!po || po.status === 'received' || po.status === 'cancelled') return;
      setPurchaseOrders((list) => list.map((p) => (p.id === id ? { ...p, status: 'received' } : p)));
      setProducts((list) =>
        list.map((p) => {
          const qty = po.lines.filter((l) => l.productId === p.id).reduce((a, l) => a + l.quantity, 0);
          return qty ? { ...p, stock: p.stock + qty } : p;
        }),
      );
    },
    [purchaseOrders],
  );

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    setTasks((list) => [...list, { ...task, id: `t${Date.now()}` }]);
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const value = useMemo(
    () => ({
      invoices,
      transactions,
      expenses,
      deals,
      bills,
      products,
      purchaseOrders,
      payroll,
      addInvoice,
      markInvoicePaid,
      moveDeal,
      receivePurchaseOrder,
      tasks,
      addTask,
      moveTask,
      nextInvoiceNumber: `INV-${nextNumber}`,
    }),
    [invoices, transactions, expenses, deals, bills, products, purchaseOrders, payroll, addInvoice, markInvoicePaid, moveDeal, receivePurchaseOrder, tasks, addTask, moveTask, nextNumber],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
