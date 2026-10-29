/**
 * Deterministic demo data. Every number on every screen is derived from the
 * invoices and expenses generated here, so KPIs, charts and tables always
 * reconcile. Replace these generators with API calls in a real app.
 */
import { addDays, fromISO, toISO, TODAY, type ISODate } from '@/lib/date';
import { createRandom } from '@/lib/random';
import { round2 } from '@/lib/utils';
import { customers } from './customers';
import type { Bill, Deal, ExpenseCategory, Invoice, InvoiceItem, InvoiceStatus, Transaction } from './types';

const START: ISODate = '2025-01-01';

const catalog: { description: string; price: [number, number]; qty: [number, number] }[] = [
  { description: 'ERP platform licence (annual seats)', price: [120, 180], qty: [10, 60] },
  { description: 'Implementation services (hours)', price: [140, 165], qty: [8, 40] },
  { description: 'Premium support plan (monthly)', price: [900, 1600], qty: [1, 3] },
  { description: 'Data migration package', price: [2500, 6000], qty: [1, 1] },
  { description: 'Staff training workshop', price: [1200, 2400], qty: [1, 2] },
  { description: 'CRM add-on licence (seats)', price: [45, 75], qty: [10, 50] },
];

export function invoiceTotals(inv: Pick<Invoice, 'items' | 'taxRate'>) {
  const subtotal = round2(inv.items.reduce((a, it) => a + it.quantity * it.unitPrice, 0));
  const tax = round2((subtotal * inv.taxRate) / 100);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

function monthsBetween(from: ISODate, to: ISODate) {
  const out: { y: number; m: number }[] = [];
  const d = fromISO(from);
  d.setDate(1);
  while (toISO(d) <= to) {
    out.push({ y: d.getFullYear(), m: d.getMonth() });
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

function dayIn(y: number, m: number, day: number): ISODate {
  const last = new Date(y, m + 1, 0).getDate();
  return toISO(new Date(y, m, Math.min(day, last)));
}

export function generateInvoices(): Invoice[] {
  const rnd = createRandom(2026);
  const list: Invoice[] = [];
  monthsBetween(START, TODAY).forEach(({ y, m }, idx) => {
    const count = 7 + Math.floor(idx / 4) + rnd.int(0, 2);
    for (let i = 0; i < count; i++) {
      const issueDate = dayIn(y, m, rnd.int(1, 28));
      if (issueDate > TODAY) continue;
      const lines = rnd.int(1, 3);
      const used = new Set<number>();
      const items: InvoiceItem[] = [];
      for (let l = 0; l < lines; l++) {
        let k = rnd.int(0, catalog.length - 1);
        while (used.has(k)) k = (k + 1) % catalog.length;
        used.add(k);
        const c = catalog[k]!;
        items.push({
          description: c.description,
          quantity: rnd.int(c.qty[0], c.qty[1]),
          unitPrice: Math.round(rnd.between(c.price[0], c.price[1])),
        });
      }
      const dueDate = addDays(issueDate, 30);
      let status: InvoiceStatus;
      let paidDate: ISODate | undefined;
      const payAfter = rnd.int(6, 38);
      const candidatePaid = addDays(issueDate, payAfter);
      const ageDays = (fromISO(TODAY).getTime() - fromISO(issueDate).getTime()) / 86_400_000;
      if (ageDays <= 10 && rnd.chance(0.35)) {
        status = 'draft';
      } else if (candidatePaid <= TODAY && rnd.chance(dueDate < TODAY ? 0.96 : 0.55)) {
        status = 'paid';
        paidDate = candidatePaid;
      } else {
        status = dueDate < TODAY ? 'overdue' : 'pending';
      }
      list.push({
        id: '',
        number: '',
        customerId: rnd.pick(customers).id,
        issueDate,
        dueDate,
        items,
        taxRate: 8,
        status,
        paidDate,
      });
    }
  });
  list.sort((a, b) => a.issueDate.localeCompare(b.issueDate));
  list.forEach((inv, i) => {
    inv.id = `inv-${1001 + i}`;
    inv.number = `INV-${1001 + i}`;
  });
  return list.reverse();
}

const vendors: Record<ExpenseCategory, string[]> = {
  Payroll: ['Payroll run'],
  Operations: ['Orbis Facilities', 'City Power & Water', 'Swift Couriers', 'Office lease — HQ'],
  Marketing: ['Brightline Media', 'Adwave Network', 'Eventhall Expo', 'Social ads'],
  Software: ['Halcyon Cloud', 'E-signature service', 'Design suite seats', 'Analytics platform'],
  Other: ['Insurance premium', 'Legal counsel', 'Travel & lodging', 'Office supplies'],
};

export function generateExpenses(): Transaction[] {
  const rnd = createRandom(77);
  const out: Transaction[] = [];
  const add = (date: ISODate, category: ExpenseCategory, amount: number, method: Transaction['method']) => {
    if (date > TODAY || date < START) return;
    const recent = (fromISO(TODAY).getTime() - fromISO(date).getTime()) / 86_400_000 < 6;
    out.push({
      id: '',
      date,
      party: rnd.pick(vendors[category]),
      type: 'expense',
      category,
      amount: round2(amount),
      status: recent && rnd.chance(0.5) ? 'pending' : 'completed',
      method,
    });
  };
  monthsBetween(START, TODAY).forEach(({ y, m }, idx) => {
    const growth = 1 + idx * 0.012;
    add(dayIn(y, m, 1), 'Payroll', 18_200 * growth + rnd.between(-600, 600), 'Auto-debit');
    add(dayIn(y, m, 5), 'Operations', 7_800, 'Bank transfer');
    for (let i = 0; i < rnd.int(2, 4); i++) add(dayIn(y, m, rnd.int(2, 28)), 'Operations', rnd.between(400, 2600), 'Card');
    for (let i = 0; i < rnd.int(2, 3); i++) add(dayIn(y, m, rnd.int(2, 28)), 'Marketing', rnd.between(900, 3600) * growth, 'Card');
    for (let i = 0; i < 3; i++) add(dayIn(y, m, rnd.int(2, 28)), 'Software', rnd.between(250, 1400), 'Card');
    for (let i = 0; i < rnd.int(1, 2); i++) add(dayIn(y, m, rnd.int(2, 28)), 'Other', rnd.between(300, 2200), 'Bank transfer');
  });
  return out;
}

/** Income transactions = paid invoices; merged with expenses and numbered by date. */
export function buildTransactions(invoices: Invoice[], expenses: Transaction[]): Transaction[] {
  const names = new Map(customers.map((c) => [c.id, c.company]));
  const income: Transaction[] = invoices
    .filter((inv) => inv.status === 'paid' && inv.paidDate)
    .map((inv) => ({
      id: '',
      date: inv.paidDate!,
      party: names.get(inv.customerId) ?? 'Customer',
      type: 'income',
      category: 'Sales',
      amount: invoiceTotals(inv).total,
      status: 'completed',
      method: 'Bank transfer',
      reference: inv.number,
    }));
  const all = [...income, ...expenses].sort((a, b) => a.date.localeCompare(b.date) || a.amount - b.amount);
  return all.map((t, i) => ({ ...t, id: `TX-${String(20000 + i)}` })).reverse();
}

export function generateDeals(): Deal[] {
  return [
    { id: 'd01', company: 'Aster Robotics', product: 'ERP · 120 seats', value: 18000, owner: 'Jonah Kim', stage: 'lead', closeDate: '2026-11-20' },
    { id: 'd02', company: 'Pinegate Hotels', product: 'Finance suite', value: 9500, owner: 'Ariana Moss', stage: 'lead', closeDate: '2026-11-28' },
    { id: 'd03', company: 'Lumen Dental', product: 'CRM · Starter', value: 6200, owner: 'Rhea Shah', stage: 'lead', closeDate: '2026-12-02' },
    { id: 'd04', company: 'Northwind Logistics', product: 'Inventory add-on', value: 42000, owner: 'Ariana Moss', stage: 'qualified', closeDate: '2026-11-14' },
    { id: 'd05', company: 'Corvid Security', product: 'CRM · Growth', value: 15800, owner: 'Jonah Kim', stage: 'qualified', closeDate: '2026-11-30' },
    { id: 'd06', company: 'Steppe Mining Co.', product: 'ERP · Enterprise', value: 64000, owner: 'Ariana Moss', stage: 'qualified', closeDate: '2026-12-15' },
    { id: 'd07', company: 'Kestrel Foods', product: 'Finance suite', value: 27500, owner: 'Rhea Shah', stage: 'proposal', closeDate: '2026-11-09' },
    { id: 'd08', company: 'Ferro & Vale LLP', product: 'ERP · 60 seats', value: 36000, owner: 'Ariana Moss', stage: 'proposal', closeDate: '2026-11-18' },
    { id: 'd09', company: 'Tidewater Clinics', product: 'HR & Payroll', value: 12400, owner: 'Jonah Kim', stage: 'proposal', closeDate: '2026-11-22' },
    { id: 'd10', company: 'Brightline Media', product: 'ERP · Enterprise', value: 54000, owner: 'Ariana Moss', stage: 'negotiation', closeDate: '2026-11-06' },
    { id: 'd11', company: 'Orbis Facilities', product: 'CRM · Growth', value: 21300, owner: 'Rhea Shah', stage: 'negotiation', closeDate: '2026-11-11' },
    { id: 'd12', company: 'Halcyon Cloud', product: 'Finance suite', value: 31200, owner: 'Jonah Kim', stage: 'won', closeDate: '2026-10-24' },
    { id: 'd13', company: 'Marlow Studio', product: 'CRM · Starter', value: 8900, owner: 'Ariana Moss', stage: 'won', closeDate: '2026-10-19' },
  ];
}

/** Scheduled payments after TODAY, based on the recurring expenses above. */
export function upcomingBills(expenses: Transaction[], headcount = 12): Bill[] {
  const lastPayroll = expenses.filter((e) => e.category === 'Payroll').sort((a, b) => b.date.localeCompare(a.date))[0];
  return [
    { id: 'b1', name: 'Payroll', detail: `${headcount} employees · Auto-debit`, dueDate: '2026-11-01', amount: round2((lastPayroll?.amount ?? 26000) * 1.01) },
    { id: 'b2', name: 'Halcyon Cloud', detail: 'Infrastructure · Card', dueDate: '2026-11-03', amount: 1380 },
    { id: 'b3', name: 'Office lease — HQ', detail: 'Operations · Bank transfer', dueDate: '2026-11-05', amount: 7800 },
    { id: 'b4', name: 'Insurance premium', detail: 'Quarterly · Bank transfer', dueDate: '2026-11-10', amount: 1940 },
  ];
}
