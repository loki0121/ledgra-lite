import { ArrowLeft, Search } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-text">Error 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-muted">
        The page you’re looking for moved or never existed. Check the address, or head back to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to dashboard
        </ButtonLink>
        <ButtonLink to="/transactions" variant="secondary">
          <Search className="h-4 w-4" aria-hidden /> Browse transactions
        </ButtonLink>
      </div>
    </div>
  );
}
