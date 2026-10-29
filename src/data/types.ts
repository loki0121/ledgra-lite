import type { ISODate } from '@/lib/date';

export interface Customer {
  id: string;
  company: string;
  contact: string;
  email: string;
  country: string;
  industry: string;
  owner: string;
  since: ISODate;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  issueDate: ISODate;
  dueDate: ISODate;
  items: InvoiceItem[];
  /** Percentage, e.g. 8 for 8% */
  taxRate: number;
  status: InvoiceStatus;
  paidDate?: ISODate;
  notes?: string;
}

export type ExpenseCategory = 'Payroll' | 'Operations' | 'Marketing' | 'Software' | 'Other';
export type TransactionCategory = 'Sales' | ExpenseCategory;

export interface Transaction {
  id: string;
  date: ISODate;
  party: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  /** Always positive; `type` gives the direction. */
  amount: number;
  status: 'completed' | 'pending';
  method: 'Bank transfer' | 'Card' | 'Auto-debit';
  /** Invoice number for income generated from a paid invoice. */
  reference?: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won';

export interface Deal {
  id: string;
  company: string;
  product: string;
  value: number;
  owner: string;
  stage: DealStage;
  closeDate: ISODate;
}

export interface Bill {
  id: string;
  name: string;
  detail: string;
  dueDate: ISODate;
  amount: number;
}
