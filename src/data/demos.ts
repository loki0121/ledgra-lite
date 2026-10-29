/**
 * Data for the extra dashboard demos (e-commerce, SaaS, projects).
 * Seeded like the rest of the demo so numbers are stable between loads.
 */
import { addDays, diffDays, TODAY, type ISODate } from '@/lib/date';
import { createRandom } from '@/lib/random';
import { round2 } from '@/lib/utils';
import type { Product } from './operations';

/* ----------------------------- E-commerce ----------------------------- */

export type Channel = 'Online store' | 'Marketplace' | 'Social' | 'Wholesale';
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'refunded';

export interface Order {
  id: string;
  number: string;
  date: ISODate;
  customer: string;
  country: string;
  channel: Channel;
  status: OrderStatus;
  lines: { productId: string; quantity: number; price: number }[];
}

export const orderTotal = (o: Order) => round2(o.lines.reduce((a, l) => a + l.quantity * l.price, 0));

const shoppers = [
  ['Mia Chen', 'Singapore'], ['Lucas Silva', 'Brazil'], ['Ella Novak', 'Czechia'], ['Omar Haddad', 'UAE'],
  ['Zoe Martin', 'France'], ['Ken Watanabe', 'Japan'], ['Anu Batsaikhan', 'Mongolia'], ['Leo Rossi', 'Italy'],
  ['Isla Brown', 'United Kingdom'], ['Noah Becker', 'Germany'], ['Ava Johnson', 'United States'], ['Ravi Iyer', 'India'],
] as const;

export function generateOrders(products: Product[]): Order[] {
  const rnd = createRandom(5150);
  const sellable = products.filter((p) => p.category !== 'Licences');
  const channels: [Channel, number][] = [['Online store', 0.5], ['Marketplace', 0.25], ['Social', 0.15], ['Wholesale', 0.1]];
  const pickChannel = () => {
    let r = rnd.next();
    for (const [c, w] of channels) {
      if ((r -= w) <= 0) return c;
    }
    return 'Online store' as Channel;
  };
  const list: Order[] = [];
  for (let d = 59; d >= 0; d--) {
    const date = addDays(TODAY, -d);
    const count = rnd.int(3, 8) + (d < 14 ? 2 : 0);
    for (let i = 0; i < count; i++) {
      const [customer, country] = rnd.pick(shoppers);
      const channel = pickChannel();
      const lines = Array.from({ length: rnd.int(1, 3) }, () => {
        const p = rnd.pick(sellable);
        return { productId: p.id, quantity: channel === 'Wholesale' ? rnd.int(3, 8) : rnd.int(1, 2), price: p.price };
      });
      const age = diffDays(TODAY, date);
      const status: OrderStatus = rnd.chance(0.03) ? 'refunded' : age <= 1 ? 'processing' : age <= 5 ? 'shipped' : 'delivered';
      list.push({ id: '', number: '', date, customer, country, channel, status, lines });
    }
  }
  list.forEach((o, i) => {
    o.id = `ord-${8801 + i}`;
    o.number = `#${8801 + i}`;
  });
  return list.reverse();
}

/* -------------------------------- SaaS -------------------------------- */

export type Plan = 'Starter' | 'Growth' | 'Enterprise';
export const planPrice: Record<Plan, number> = { Starter: 49, Growth: 149, Enterprise: 499 };

export interface Subscription {
  id: string;
  company: string;
  plan: Plan;
  seats: number;
  start: ISODate;
  end?: ISODate;
}

export const subscriptionMrr = (s: Subscription) => planPrice[s.plan] * (s.plan === 'Starter' ? 1 : Math.max(1, Math.round(s.seats / 10)));

const prefixes = ['Blue', 'North', 'Bright', 'Iron', 'Silver', 'Cedar', 'Nova', 'Apex', 'Pixel', 'Atlas', 'Lumen', 'Harbor', 'Summit', 'Echo', 'Orbit'];
const suffixes = ['Labs', 'Works', 'Health', 'Logistics', 'Studio', 'Foods', 'Capital', 'Robotics', 'Retail', 'Analytics'];

export function generateSubscriptions(): Subscription[] {
  const rnd = createRandom(1234);
  const out: Subscription[] = [];
  const start0 = addDays(TODAY, -540);
  for (let i = 0; i < 260; i++) {
    const start = addDays(start0, Math.floor(Math.pow(rnd.next(), 0.75) * 540));
    const r = rnd.next();
    const plan: Plan = r < 0.55 ? 'Starter' : r < 0.9 ? 'Growth' : 'Enterprise';
    const churn = rnd.chance(0.22);
    const end = churn ? addDays(start, rnd.int(45, 400)) : undefined;
    out.push({
      id: `sub-${i + 1}`,
      company: `${rnd.pick(prefixes)} ${rnd.pick(suffixes)}`,
      plan,
      seats: plan === 'Starter' ? rnd.int(1, 5) : plan === 'Growth' ? rnd.int(8, 40) : rnd.int(40, 160),
      start,
      end: end && end <= TODAY ? end : undefined,
    });
  }
  return out.sort((a, b) => b.start.localeCompare(a.start));
}

export const isActive = (s: Subscription, on: ISODate) => s.start <= on && (!s.end || s.end > on);

/* ------------------------------ Projects ------------------------------ */

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  client: string;
  lead: string;
  budget: number;
  spent: number;
  start: ISODate;
  due: ISODate;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: Priority;
  due: ISODate;
}

export const projects: Project[] = [
  { id: 'pr1', name: 'Northwind ERP rollout', client: 'Northwind Logistics', lead: 'Tomás Rivera', budget: 48000, spent: 31200, start: '2026-08-04', due: '2026-12-12' },
  { id: 'pr2', name: 'Kestrel finance migration', client: 'Kestrel Foods', lead: 'Ariana Moss', budget: 22000, spent: 19800, start: '2026-07-14', due: '2026-11-15' },
  { id: 'pr3', name: 'Halcyon CRM onboarding', client: 'Halcyon Cloud', lead: 'Nomin Batbayar', budget: 15000, spent: 6100, start: '2026-09-22', due: '2026-12-20' },
  { id: 'pr4', name: 'Steppe inventory pilot', client: 'Steppe Mining Co.', lead: 'Amara Eze', budget: 36000, spent: 9400, start: '2026-10-01', due: '2027-02-28' },
];

const taskSeed: [string, string, TaskStatus, Priority, number][] = [
  ['pr1', 'Map chart of accounts', 'done', 'high', -20],
  ['pr1', 'Configure warehouses', 'done', 'medium', -12],
  ['pr1', 'Import opening balances', 'review', 'high', 2],
  ['pr1', 'Train finance team', 'todo', 'medium', 18],
  ['pr1', 'Set up approval rules', 'in-progress', 'medium', 6],
  ['pr2', 'Reconcile legacy ledger', 'in-progress', 'high', 1],
  ['pr2', 'Migrate open invoices', 'review', 'high', -2],
  ['pr2', 'Cut-over checklist', 'todo', 'high', 9],
  ['pr2', 'Archive old system', 'todo', 'low', 20],
  ['pr3', 'Import contacts', 'done', 'medium', -8],
  ['pr3', 'Design pipeline stages', 'in-progress', 'medium', 4],
  ['pr3', 'Email integration', 'todo', 'low', 15],
  ['pr3', 'Sales team workshop', 'todo', 'medium', 25],
  ['pr4', 'Site survey', 'done', 'medium', -15],
  ['pr4', 'Barcode label templates', 'in-progress', 'low', 7],
  ['pr4', 'Scanner rollout plan', 'review', 'medium', 3],
  ['pr4', 'Stock count procedure', 'todo', 'high', 12],
];

const assignees = ['Tomás Rivera', 'Ariana Moss', 'Nomin Batbayar', 'Amara Eze', 'Wen Li', 'Clara Weiss', 'Felix Andersen'];

export function generateTasks(): Task[] {
  const rnd = createRandom(77);
  return taskSeed.map(([projectId, title, status, priority, dueIn], i) => ({
    id: `t${i + 1}`,
    projectId,
    title,
    assignee: rnd.pick(assignees),
    status,
    priority,
    due: addDays(TODAY, dueIn),
  }));
}

export const taskAssignees = assignees;
