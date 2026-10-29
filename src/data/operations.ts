/**
 * Inventory, purchasing and people data. Like the finance data, everything is
 * seeded so it is identical on every load, and payroll figures are derived
 * from the payroll expenses the dashboard already shows.
 */
import { addDays, TODAY, type ISODate } from '@/lib/date';
import { createRandom } from '@/lib/random';
import { round2 } from '@/lib/utils';
import type { Transaction } from './types';

/* ------------------------------ Products ------------------------------ */

export type ProductCategory = 'Hardware' | 'Networking' | 'Accessories' | 'Office' | 'Licences';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  supplierId: string;
  warehouse: 'Main' | 'East' | 'West';
  stock: number;
  reorderLevel: number;
  cost: number;
  price: number;
}

export type StockStatus = 'in-stock' | 'low' | 'out';

export function stockStatus(p: Pick<Product, 'stock' | 'reorderLevel'>): StockStatus {
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.reorderLevel) return 'low';
  return 'in-stock';
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  leadDays: number;
}

export const suppliers: Supplier[] = [
  { id: 's1', name: 'Kinetic Components', country: 'Taiwan', leadDays: 21 },
  { id: 's2', name: 'Northbridge Networks', country: 'Germany', leadDays: 14 },
  { id: 's3', name: 'Paperline Office Supply', country: 'United States', leadDays: 5 },
  { id: 's4', name: 'Arcadia Peripherals', country: 'South Korea', leadDays: 18 },
];

export const supplierById = new Map(suppliers.map((s) => [s.id, s]));

const productSeed: [string, ProductCategory, string, number][] = [
  ['Rugged handheld scanner', 'Hardware', 's1', 310],
  ['Thermal label printer', 'Hardware', 's1', 185],
  ['POS terminal 15"', 'Hardware', 's1', 540],
  ['Barcode scanner (wireless)', 'Hardware', 's4', 96],
  ['Receipt printer', 'Hardware', 's4', 142],
  ['24-port gigabit switch', 'Networking', 's2', 260],
  ['Wi-Fi 6 access point', 'Networking', 's2', 165],
  ['Edge router', 'Networking', 's2', 220],
  ['Cat6 patch cable (pack of 10)', 'Networking', 's2', 18],
  ['USB-C docking station', 'Accessories', 's4', 120],
  ['Cash drawer', 'Accessories', 's4', 74],
  ['Card reader stand', 'Accessories', 's4', 22],
  ['Thermal paper rolls (50)', 'Office', 's3', 31],
  ['Shipping labels (1,000)', 'Office', 's3', 24],
  ['A4 copy paper (box)', 'Office', 's3', 28],
  ['Ledgra POS licence (annual)', 'Licences', 's1', 90],
  ['Ledgra Inventory licence (annual)', 'Licences', 's1', 120],
  ['Device management licence', 'Licences', 's2', 36],
];

export function generateProducts(): Product[] {
  const rnd = createRandom(404);
  const warehouses: Product['warehouse'][] = ['Main', 'East', 'West'];
  return productSeed.map(([name, category, supplierId, cost], i) => {
    const reorderLevel = category === 'Licences' ? 0 : rnd.int(8, 30);
    const roll = rnd.next();
    const stock = category === 'Licences' ? 999 : roll < 0.12 ? 0 : roll < 0.3 ? rnd.int(1, reorderLevel) : rnd.int(reorderLevel + 5, reorderLevel * 6);
    return {
      id: `p${String(i + 1).padStart(2, '0')}`,
      sku: `${category.slice(0, 3).toUpperCase()}-${String(1040 + i * 7)}`,
      name,
      category,
      supplierId,
      warehouse: rnd.pick(warehouses),
      stock,
      reorderLevel,
      cost,
      price: Math.round(cost * rnd.between(1.35, 1.8)),
    };
  });
}

/* --------------------------- Purchase orders -------------------------- */

export type POStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  orderDate: ISODate;
  expectedDate: ISODate;
  status: POStatus;
  lines: { productId: string; quantity: number; unitCost: number }[];
}

export const poTotal = (po: PurchaseOrder) => round2(po.lines.reduce((a, l) => a + l.quantity * l.unitCost, 0));

export function generatePurchaseOrders(products: Product[]): PurchaseOrder[] {
  const rnd = createRandom(918);
  const list: PurchaseOrder[] = [];
  for (let i = 0; i < 26; i++) {
    const supplier = rnd.pick(suppliers);
    const orderDate = addDays(TODAY, -rnd.int(0, 120));
    const expectedDate = addDays(orderDate, supplier.leadDays);
    const pool = products.filter((p) => p.supplierId === supplier.id);
    const lines = Array.from({ length: rnd.int(1, Math.min(3, pool.length)) }, (_, k) => {
      const p = pool[(k + i) % pool.length]!;
      return { productId: p.id, quantity: rnd.int(5, 60), unitCost: p.cost };
    });
    let status: POStatus;
    if (expectedDate < TODAY) status = rnd.chance(0.92) ? 'received' : 'cancelled';
    else status = rnd.chance(0.2) ? 'draft' : 'ordered';
    list.push({ id: '', number: '', supplierId: supplier.id, orderDate, expectedDate, status, lines });
  }
  list.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
  list.forEach((po, i) => {
    po.id = `po-${501 + i}`;
    po.number = `PO-${501 + i}`;
  });
  return list.reverse();
}

/* ------------------------------ Employees ----------------------------- */

export interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: 'Finance' | 'Sales' | 'Engineering' | 'Operations' | 'People';
  location: string;
  startDate: ISODate;
  status: 'active' | 'on-leave';
  /** Relative pay weight; actual monthly pay = weight share × payroll run. */
  payWeight: number;
}

export const employees: Employee[] = [
  { id: 'e01', name: 'Ariana Moss', email: 'ariana@ledgra.example', title: 'Finance lead', department: 'Finance', location: 'Remote — US', startDate: '2021-04-12', status: 'active', payWeight: 1.35 },
  { id: 'e02', name: 'Jonah Kim', email: 'jonah@ledgra.example', title: 'Account executive', department: 'Sales', location: 'Seoul', startDate: '2022-02-01', status: 'active', payWeight: 1.1 },
  { id: 'e03', name: 'Rhea Shah', email: 'rhea@ledgra.example', title: 'Account executive', department: 'Sales', location: 'London', startDate: '2022-08-15', status: 'active', payWeight: 1.1 },
  { id: 'e04', name: 'Tomás Rivera', email: 'tomas@ledgra.example', title: 'Senior engineer', department: 'Engineering', location: 'Madrid', startDate: '2021-09-06', status: 'active', payWeight: 1.4 },
  { id: 'e05', name: 'Nomin Batbayar', email: 'nomin@ledgra.example', title: 'Frontend engineer', department: 'Engineering', location: 'Ulaanbaatar', startDate: '2023-03-20', status: 'active', payWeight: 1.15 },
  { id: 'e06', name: 'Felix Andersen', email: 'felix@ledgra.example', title: 'Backend engineer', department: 'Engineering', location: 'Copenhagen', startDate: '2023-11-01', status: 'on-leave', payWeight: 1.2 },
  { id: 'e07', name: 'Amara Eze', email: 'amara@ledgra.example', title: 'Operations manager', department: 'Operations', location: 'Lagos', startDate: '2022-05-09', status: 'active', payWeight: 1.05 },
  { id: 'e08', name: 'Wen Li', email: 'wen@ledgra.example', title: 'Inventory analyst', department: 'Operations', location: 'Singapore', startDate: '2024-01-15', status: 'active', payWeight: 0.85 },
  { id: 'e09', name: 'Clara Weiss', email: 'clara@ledgra.example', title: 'Accountant', department: 'Finance', location: 'Vienna', startDate: '2023-06-12', status: 'active', payWeight: 0.95 },
  { id: 'e10', name: 'Marcus Hale', email: 'marcus@ledgra.example', title: 'Sales development rep', department: 'Sales', location: 'Remote — US', startDate: '2025-02-03', status: 'active', payWeight: 0.75 },
  { id: 'e11', name: 'Sofia Marin', email: 'sofia@ledgra.example', title: 'People partner', department: 'People', location: 'Bucharest', startDate: '2024-07-22', status: 'active', payWeight: 0.9 },
  { id: 'e12', name: 'Dev Malhotra', email: 'dev@ledgra.example', title: 'Support specialist', department: 'Operations', location: 'Pune', startDate: '2025-06-30', status: 'active', payWeight: 0.7 },
];

export interface PayrollRun {
  id: string;
  date: ISODate;
  total: number;
  status: Transaction['status'];
}

/** Payroll runs are the payroll expense transactions, newest first. */
export function payrollRuns(expenses: Transaction[]): PayrollRun[] {
  return expenses
    .filter((e) => e.category === 'Payroll')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => ({ id: e.id || e.date, date: e.date, total: e.amount, status: e.status }));
}

/** Splits one payroll run across employees by pay weight (cents reconcile exactly). */
export function payslips(run: PayrollRun) {
  const totalWeight = employees.reduce((a, e) => a + e.payWeight, 0);
  const cents = Math.round(run.total * 100);
  let allocated = 0;
  return employees.map((e, i) => {
    const share = i === employees.length - 1 ? cents - allocated : Math.round((cents * e.payWeight) / totalWeight);
    allocated += share;
    const gross = share / 100;
    const tax = round2(gross * 0.18);
    return { employee: e, gross, tax, net: round2(gross - tax) };
  });
}
