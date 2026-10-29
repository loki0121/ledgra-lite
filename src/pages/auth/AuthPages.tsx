import { useState, type ComponentProps, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Info, MailCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, Field, Input } from '@/components/ui/Form';
import { demoAccount } from '@/config/auth';
import { OrDivider, SocialButtons } from '@/components/auth/SocialButtons';
import { useSettings } from '@/providers/SettingsProvider';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function PasswordInput(props: ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-r-[10px] text-muted hover:text-fg"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

/* ----------------------------- Login ----------------------------- */

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('That doesn’t look like an email address'),
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean().optional(),
});

export function Login() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const fillDemo = () => {
    if (!demoAccount) return;
    setValue('email', demoAccount.email, { shouldValidate: true });
    setValue('password', demoAccount.password, { shouldValidate: true });
  };

  return (
    <>
      <Heading title="Welcome back" subtitle={`Sign in to your ${settings.brandName} workspace.`} />
      {demoAccount && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-text" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Demo account</p>
            <p className="text-muted">
              {demoAccount.email} · {demoAccount.password}
            </p>
          </div>
          <button type="button" onClick={fillDemo} className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-primary-text hover:bg-primary/10">
            Fill in
          </button>
        </div>
      )}
      <SocialButtons
        onSelect={async () => {
          await wait(600); // replace with your auth provider's sign-in call
          navigate('/');
        }}
      />
      <OrDivider />
      {failed && (
        <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-danger/40 bg-danger-soft p-3.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Wrong email or password. Use the demo account above, or any password with 6+ characters.
        </div>
      )}
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (v) => {
          setFailed(false);
          await wait(500);
          if (v.password.length < 6) return setFailed(true);
          navigate('/');
        })}
      >
        <Field label="Email" error={errors.email?.message}>
          {(p) => <Input type="email" autoComplete="email" {...p} {...register('email')} />}
        </Field>
        <div className="flex flex-col gap-1.5">
          <Field label="Password" error={errors.password?.message}>
            {(p) => <PasswordInput autoComplete="current-password" {...p} {...register('password')} />}
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Checkbox label="Remember me" {...register('remember')} />
          <Link to="/auth/forgot-password" className="text-sm font-semibold text-primary-text hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/auth/register" className="font-semibold text-primary-text hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

/* ---------------------------- Register --------------------------- */

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    company: z.string().trim().min(2, 'Enter your company name'),
    email: z.string().trim().min(1, 'Enter your email').email('That doesn’t look like an email address'),
    password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Include at least one number'),
    confirm: z.string().min(1, 'Repeat your password'),
    terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords don’t match' });

type RegisterValues = z.input<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: 'onTouched' });

  return (
    <>
      <Heading title="Create your account" subtitle="Start a 14-day trial. No card required." />
      <SocialButtons
        action="Sign up"
        onSelect={async () => {
          await wait(600); // replace with your auth provider's sign-up call
          navigate('/');
        }}
      />
      <OrDivider label="or sign up with email" />
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async () => {
          await wait(600);
          navigate('/');
        })}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            {(p) => <Input autoComplete="name" {...p} {...register('name')} />}
          </Field>
          <Field label="Company" error={errors.company?.message}>
            {(p) => <Input autoComplete="organization" {...p} {...register('company')} />}
          </Field>
        </div>
        <Field label="Work email" error={errors.email?.message}>
          {(p) => <Input type="email" autoComplete="email" {...p} {...register('email')} />}
        </Field>
        <Field label="Password" error={errors.password?.message} hint="8+ characters, including a number.">
          {(p) => <PasswordInput autoComplete="new-password" {...p} {...register('password')} />}
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          {(p) => <PasswordInput autoComplete="new-password" {...p} {...register('confirm')} />}
        </Field>
        <div>
          <Checkbox label="I agree to the Terms of Service and Privacy Policy" {...register('terms')} />
          {errors.terms && (
            <p role="alert" className="text-[13px] text-danger">
              {errors.terms.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-primary-text hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

/* ------------------------- Forgot password ------------------------ */

const forgotSchema = z.object({ email: z.string().trim().min(1, 'Enter your email').email('That doesn’t look like an email address') });

export function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });

  if (sentTo) {
    return (
      <div className="flex flex-col items-start gap-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-text">
          <MailCheck className="h-6 w-6" aria-hidden />
        </span>
        <Heading title="Check your inbox" subtitle={<>We sent a reset link to <strong className="text-fg">{sentTo}</strong>. It expires in 30 minutes.</>} />
        <ButtonLink to="/auth/login" variant="secondary" className="w-full">
          Back to sign in
        </ButtonLink>
        <button type="button" onClick={() => setSentTo(null)} className="text-sm font-semibold text-primary-text hover:underline">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      <Link to="/auth/login" className="mb-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-fg-2 hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to sign in
      </Link>
      <Heading title="Reset your password" subtitle="Enter the email you use to sign in and we’ll send you a reset link." />
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (v) => {
          await wait(500);
          setSentTo(v.email);
        })}
      >
        <Field label="Email" error={errors.email?.message}>
          {(p) => <Input type="email" autoComplete="email" {...p} {...register('email')} />}
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </>
  );
}
