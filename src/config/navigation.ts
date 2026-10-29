import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  Repeat,
  ShoppingBag,
  UserRound,
  ClipboardList,
  Contact,
  FileText,
  KanbanSquare,
  LayoutGrid,
  LogIn,
  Package,
  SearchX,
  ServerCrash,
  Settings,
  Tag,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Optional count shown on the right of the item. */
  badge?: string;
  /** Extra words the command palette should match. */
  keywords?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar menu. Add, remove or reorder items here — the sidebar, mobile
 * drawer and ⌘K command palette all read from this list.
 * Items marked PRO open an upgrade page in Ledgra Lite.
 */
export const navigation: NavSection[] = [
  {
    title: 'Dashboards',
    items: [
      { label: 'Finance', to: '/', icon: LayoutGrid, keywords: 'home dashboard overview kpi cash' },
      { label: 'Sales', to: '/dashboards/sales', badge: 'PRO', icon: TrendingUp, keywords: 'dashboard crm bookings revenue' },
      { label: 'E-commerce', to: '/dashboards/ecommerce', badge: 'PRO', icon: ShoppingBag, keywords: 'dashboard store orders shop' },
      { label: 'SaaS', to: '/dashboards/saas', badge: 'PRO', icon: Repeat, keywords: 'dashboard mrr subscriptions churn' },
      { label: 'Projects', to: '/dashboards/projects', badge: 'PRO', icon: FolderKanban, keywords: 'dashboard projects budget deadlines' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight, keywords: 'ledger payments expenses income' },
      { label: 'Invoices', to: '/invoices', icon: FileText, keywords: 'billing receivables' },
      { label: 'Reports', to: '/reports', badge: 'PRO', icon: BarChart3, keywords: 'profit loss p&l statement' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Pipeline', to: '/crm/pipeline', badge: 'PRO', icon: KanbanSquare, keywords: 'crm deals kanban' },
      { label: 'Customers', to: '/crm/customers', badge: 'PRO', icon: Users, keywords: 'crm clients accounts' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Products', to: '/inventory/products', badge: 'PRO', icon: Package, keywords: 'inventory stock sku warehouse' },
      { label: 'Purchase orders', to: '/inventory/purchase-orders', badge: 'PRO', icon: ClipboardList, keywords: 'po suppliers procurement' },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Employees', to: '/hr/employees', badge: 'PRO', icon: Contact, keywords: 'hr staff team directory' },
      { label: 'Payroll', to: '/hr/payroll', badge: 'PRO', icon: Wallet, keywords: 'salary payslips hr' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Task board', to: '/projects/tasks', badge: 'PRO', icon: CheckSquare, keywords: 'kanban todo projects' },
      { label: 'Calendar', to: '/calendar', badge: 'PRO', icon: CalendarDays, keywords: 'schedule due dates events' },
      { label: 'Notifications', to: '/notifications', badge: 'PRO', icon: Bell, keywords: 'alerts inbox activity' },
      { label: 'Settings', to: '/settings', icon: Settings, keywords: 'branding theme currency profile' },
    ],
  },
  {
    title: 'Pages',
    items: [
      { label: 'Profile', to: '/profile', badge: 'PRO', icon: UserRound, keywords: 'account me user' },
      { label: 'Sign in', to: '/auth/login', icon: LogIn, keywords: 'login register auth password' },
      { label: 'Pricing', to: '/pricing', badge: 'PRO', icon: Tag, keywords: 'plans billing subscription' },
      { label: 'Error 404', to: '/404', icon: SearchX, keywords: 'not found' },
      { label: 'Error 500', to: '/500', badge: 'PRO', icon: ServerCrash, keywords: 'server error' },
    ],
  },
];
