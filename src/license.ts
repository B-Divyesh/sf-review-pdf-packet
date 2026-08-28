const PRODUCT = 'review-pdf-packet';
const TOKEN_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT}`;
const DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number; reason?: string }
interface VerifyResponse { valid: boolean; reason: string; expires_at?: string | null }

export type LicenseUpdate = (valid: boolean, message: string) => void;

export function storedLicense(): string | null { return localStorage.getItem(TOKEN_KEY); }

function cachedVerdict(): Verdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict | null; }
  catch { return null; }
}

function setVerdict(value: Verdict): void { localStorage.setItem(VERDICT_KEY, JSON.stringify(value)); }

export function hasOptimisticUnlock(): boolean {
  const verdict = cachedVerdict();
  return Boolean(storedLicense() && verdict?.valid);
}

export async function verifyLicense(token: string, force = false): Promise<VerifyResponse> {
  const clean = token.trim();
  if (!clean) return { valid: false, reason: 'invalid' };
  const verdict = cachedVerdict();
  if (!force && localStorage.getItem(TOKEN_KEY) === clean && verdict && Date.now() - verdict.checkedAt < DAY) {
    return { valid: verdict.valid, reason: verdict.reason ?? (verdict.valid ? 'ok' : 'invalid') };
  }
  const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(clean)}`, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('License service unavailable');
  const result = await response.json() as VerifyResponse;
  localStorage.setItem(TOKEN_KEY, clean);
  setVerdict({ valid: result.valid, checkedAt: Date.now(), reason: result.reason });
  return result;
}

export async function initialiseLicense(update: LicenseUpdate): Promise<boolean> {
  const url = new URL(window.location.href);
  const returned = url.searchParams.get('license');
  if (returned) {
    localStorage.setItem(TOKEN_KEY, returned);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  const token = returned ?? storedLicense();
  if (!token) return false;

  const optimistic = hasOptimisticUnlock();
  if (optimistic) update(true, 'Plus is unlocked.');
  // Browsers report a failed cross-origin fetch as a console resource error even
  // when the rejection is handled. Preserve the cached unlock without starting
  // a request that cannot succeed while the device is known to be offline.
  if (!navigator.onLine) {
    update(optimistic, optimistic ? 'Plus is unlocked offline using your last verified license.' : 'Could not verify the license while offline. Reconnect and try again.');
    return optimistic;
  }
  try {
    const result = await verifyLicense(token, Boolean(returned));
    const message = result.valid ? 'Plus is unlocked on this device.' : 'This license is no longer active. You can buy a new license below.';
    update(result.valid, message);
    return result.valid;
  } catch {
    update(optimistic, optimistic ? 'Plus is unlocked offline using your last verified license.' : 'Could not verify the license. Check your connection and try again.');
    return optimistic;
  }
}
