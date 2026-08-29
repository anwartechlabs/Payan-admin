import type { AdminSession } from '../domain/admin'

const sessionStorageKey = 'sakyan.admin.session.v1'
const legacySessionStorageKey = 'payan.admin.session.v1'

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

function getDisplayName(email: string): string {
  const accountName = email.split('@')[0]
  return accountName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isAdminSession(value: unknown): value is AdminSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AdminSession>
  return (
    typeof candidate.email === 'string' &&
    typeof candidate.displayName === 'string' &&
    candidate.role === 'super_admin'
  )
}

export async function signIn(
  emailInput: string,
  password: string,
): Promise<AdminSession> {
  const email = emailInput.trim().toLowerCase()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email) || (!email.endsWith('@sakyan.ph') && !email.endsWith('@payan.ph'))) {
    throw new AuthenticationError('Use a valid @sakyan.ph workspace email.')
  }

  if (password.length < 8) {
    throw new AuthenticationError('Password must contain at least 8 characters.')
  }

  const session: AdminSession = {
    email,
    displayName: getDisplayName(email) || 'Sakyan Administrator',
    role: 'super_admin',
  }

  sessionStorage.setItem(sessionStorageKey, JSON.stringify(session))
  return session
}

export function restoreSession(): AdminSession | null {
  const serializedSession = sessionStorage.getItem(sessionStorageKey) ?? sessionStorage.getItem(legacySessionStorageKey)
  if (!serializedSession) {
    return null
  }

  try {
    const session: unknown = JSON.parse(serializedSession)
    if (isAdminSession(session)) {
      return session
    }
  } catch {
    sessionStorage.removeItem(sessionStorageKey)
    sessionStorage.removeItem(legacySessionStorageKey)
    return null
  }

  sessionStorage.removeItem(sessionStorageKey)
  sessionStorage.removeItem(legacySessionStorageKey)
  return null
}

export function signOut(): void {
  sessionStorage.removeItem(sessionStorageKey)
  sessionStorage.removeItem(legacySessionStorageKey)
}
