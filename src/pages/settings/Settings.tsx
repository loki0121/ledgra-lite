import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Form';
import { PageHeader } from '@/components/ui/misc';
import { useToast } from '@/components/ui/Toast';
import { appConfig, currencies, primaryPresets, type ThemeMode } from '@/config/app.config';
import { useSettings } from '@/providers/SettingsProvider';
import { cn, isHexColor } from '@/lib/utils';

const brandingSchema = z.object({
  brandName: z.string().trim().min(2, 'At least 2 characters').max(24, 'Keep it under 24 characters'),
  primary: z.string().refine(isHexColor, 'Use a hex color like #2F4BE0'),
  currency: z.string().min(1),
  theme: z.enum(['light', 'dark', 'system']),
});
type Branding = z.infer<typeof brandingSchema>;

const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z
      .string()
      .optional()
      .refine((v) => !v || (v.length >= 8 && /\d/.test(v)), 'At least 8 characters with one number'),
    confirm: z.string().optional(),
  })
  .refine((v) => !v.password || v.password === v.confirm, { path: ['confirm'], message: 'Passwords don’t match' });
type Profile = z.infer<typeof profileSchema>;

const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function BrandingCard() {
  const { settings, update, reset } = useSettings();
  const toast = useToast();
  const form = useForm<Branding>({ resolver: zodResolver(brandingSchema), values: settings, mode: 'onChange' });
  const { register, handleSubmit, setValue, control, formState } = form;
  const primary = useWatch({ control, name: 'primary' });
  const theme = useWatch({ control, name: 'theme' });

  return (
    <Card>
      <CardHeader title="Branding" description="Name, color, currency and theme. Saved in this browser." />
      <form
        noValidate
        onSubmit={handleSubmit((v) => {
          update(v);
          toast({ title: 'Branding saved', description: 'Changes are live across the app.' });
        })}
      >
        <CardBody className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Product name" required error={formState.errors.brandName?.message} hint="Shown in the sidebar, invoices and page title.">
            {(p) => <Input {...p} {...register('brandName')} />}
          </Field>
          <Field label="Currency" hint="Formats every amount in the app.">
            {(p) => (
              <Select {...p} {...register('currency')}>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Field label="Primary color" error={formState.errors.primary?.message}>
              {(p) => (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Pick a color"
                      value={isHexColor(primary ?? '') ? primary : '#2F4BE0'}
                      onChange={(e) => setValue('primary', e.target.value.toUpperCase(), { shouldValidate: true, shouldDirty: true })}
                      className="h-11 w-11 cursor-pointer rounded-[10px] border border-line-strong bg-surface p-1"
                    />
                    <Input {...p} {...register('primary')} className="w-[130px] font-mono uppercase" />
                  </div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Color presets">
                    {primaryPresets.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Use ${c}`}
                        aria-pressed={primary?.toLowerCase() === c.toLowerCase()}
                        onClick={() => setValue('primary', c, { shouldValidate: true, shouldDirty: true })}
                        className={cn(
                          'h-11 w-11 rounded-full ring-offset-2 ring-offset-surface transition',
                          primary?.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-fg' : 'hover:scale-105',
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Field>
          </div>

          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-medium text-fg-2">Theme</legend>
            <div className="grid grid-cols-3 gap-3 sm:max-w-md">
              {themes.map((t) => (
                <label
                  key={t.value}
                  className={cn(
                    'flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition',
                    theme === t.value ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary' : 'border-line-strong text-fg-2 hover:bg-surface-2',
                  )}
                >
                  <input type="radio" value={t.value} {...register('theme')} className="sr-only" />
                  <t.icon className="h-5 w-5" aria-hidden />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>
        </CardBody>
        <div className="flex flex-wrap justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              toast({ title: 'Defaults restored', description: `Back to ${appConfig.name} defaults.` });
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset to defaults
          </Button>
          <Button type="submit" disabled={!formState.isDirty}>
            Save branding
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ProfileCard() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: appConfig.user.name, email: appConfig.user.email, password: '', confirm: '' },
    mode: 'onTouched',
  });

  return (
    <Card>
      <CardHeader title="Profile" description="Your personal details and password." />
      <form
        noValidate
        onSubmit={handleSubmit(async (v) => {
          await new Promise((r) => setTimeout(r, 400));
          reset({ ...v, password: '', confirm: '' });
          toast({ title: 'Profile updated' });
        })}
      >
        <CardBody className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Full name" required error={errors.name?.message}>
            {(p) => <Input autoComplete="name" {...p} {...register('name')} />}
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            {(p) => <Input type="email" autoComplete="email" {...p} {...register('email')} />}
          </Field>
          <Field label="New password" error={errors.password?.message} hint="Leave blank to keep your current password.">
            {(p) => <Input type="password" autoComplete="new-password" {...p} {...register('password')} />}
          </Field>
          <Field label="Confirm new password" error={errors.confirm?.message}>
            {(p) => <Input type="password" autoComplete="new-password" {...p} {...register('confirm')} />}
          </Field>
        </CardBody>
        <div className="flex justify-end border-t border-line px-5 py-4 sm:px-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function Settings() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader title="Settings" description="Make the workspace yours." />
      <BrandingCard />
      <ProfileCard />
    </div>
  );
}
