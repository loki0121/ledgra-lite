/**
 * Social sign-in providers shown on the Sign in and Register pages.
 *
 * Remove a provider by deleting its line, or set `enabled: false`.
 * Brand icons: download each provider's official sign-in logo from its
 * brand guidelines (Google Identity, Meta, GitHub, Microsoft) into
 * /public/social/ and set `icon` to the file path, e.g. '/social/google.svg'.
 * Providers require their official artwork, so none is bundled here.
 */
export interface AuthProvider {
  id: 'google' | 'facebook' | 'github' | 'microsoft';
  label: string;
  /** Path to an official logo in /public, e.g. '/social/google.svg'. */
  icon?: string;
  enabled: boolean;
}

export const authProviders: AuthProvider[] = [
  { id: 'google', label: 'Google', enabled: true },
  { id: 'facebook', label: 'Facebook', enabled: true },
  { id: 'github', label: 'GitHub', enabled: true },
  { id: 'microsoft', label: 'Microsoft', enabled: true },
];

/** Demo credentials shown on the Sign in page. Set to null to hide the demo hint. */
export const demoAccount: { email: string; password: string } | null = {
  email: 'ariana@ledgra.example',
  password: 'demo1234',
};
