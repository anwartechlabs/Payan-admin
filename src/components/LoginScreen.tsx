import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { AuthenticationError, signIn } from '../auth/localAuthGateway'
import type { AdminSession } from '../domain/admin'
import sakyanLogo from '../assets/PAYAN_LOGO.png'

interface LoginScreenProps {
  onSignedIn: (session: AdminSession) => void
}

export function LoginScreen({ onSignedIn }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const session = await signIn(email, password)
      onSignedIn(session)
    } catch (signInError) {
      setError(
        signInError instanceof AuthenticationError
          ? signInError.message
          : 'Sign in is temporarily unavailable. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="Sakyan administration">
        <div className="login-brand-mark">
          <img src={sakyanLogo} alt="Sakyan Logo" className="brand-symbol-logo brand-symbol-logo-large" />
          <span className="brand-name">SAKYAN</span>
        </div>
        <div className="login-brand-copy">
          <p className="eyebrow eyebrow-on-dark">SAKYAN OPERATIONS</p>
          <h1>Move Valencia with confidence.</h1>
          <p>
            One secure workspace for rider verification, booking visibility,
            and day-to-day service operations.
          </p>
        </div>
        <div className="login-security-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <span>
            <strong>Restricted operations portal</strong>
            Access is limited to authorized Sakyan administrators.
          </span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="mobile-login-brand">
            <img src={sakyanLogo} alt="Sakyan Logo" className="brand-symbol-logo" />
            <span className="brand-name">SAKYAN</span>
          </div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h2>Welcome back</h2>
          <p className="login-intro">Sign in with your Sakyan workspace account.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="admin-email">Workspace email</label>
            <div className="input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="name@sakyan.ph"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby={error ? 'login-error' : undefined}
                required
              />
            </div>

            <div className="password-label-row">
              <label htmlFor="admin-password">Password</label>
              <button type="button" className="text-button" onClick={() => setError('Contact your workspace administrator to reset your password.')}>
                Forgot password?
              </button>
            </div>
            <div className="input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="admin-password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={error ? 'login-error' : undefined}
                required
              />
              <button
                type="button"
                className="input-icon-button"
                onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error ? <p className="form-error" id="login-error" role="alert">{error}</p> : null}

            <button className="primary-button login-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in to Sakyan'}
              {!isSubmitting ? <ArrowRight size={19} aria-hidden="true" /> : null}
            </button>
          </form>
          <p className="local-auth-note">
            This prototype validates a Sakyan workspace email and keeps only a
            non-sensitive session record in this browser.
          </p>
        </div>
      </section>
    </main>
  )
}
