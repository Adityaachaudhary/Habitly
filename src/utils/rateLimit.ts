export const MAX_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  lockoutUntil: number | null;
}

function getRateLimitData(action: string): RateLimitData {
  const data = localStorage.getItem(`rate_limit_${action}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Ignore parse error
    }
  }
  return { attempts: 0, lockoutUntil: null };
}

function setRateLimitData(action: string, data: RateLimitData) {
  localStorage.setItem(`rate_limit_${action}`, JSON.stringify(data));
}

export function isRateLimited(action: string): { locked: boolean; timeRemainingMs: number } {
  const data = getRateLimitData(action);
  if (!data.lockoutUntil) return { locked: false, timeRemainingMs: 0 };
  
  const now = Date.now();
  if (now > data.lockoutUntil) {
    // Lockout expired, reset
    clearRateLimit(action);
    return { locked: false, timeRemainingMs: 0 };
  }
  
  return { locked: true, timeRemainingMs: data.lockoutUntil - now };
}

export function incrementRateLimit(action: string) {
  const data = getRateLimitData(action);
  data.attempts += 1;
  
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  
  setRateLimitData(action, data);
}

export function clearRateLimit(action: string) {
  localStorage.removeItem(`rate_limit_${action}`);
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
