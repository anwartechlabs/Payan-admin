import { useEffect, useMemo, useState } from 'react'
import { AdminShell } from './components/AdminShell'
import { LoginScreen } from './components/LoginScreen'
import { OverviewPage } from './components/OverviewPage'
import { RiderReviewDrawer } from './components/RiderReviewDrawer'
import { RideDetailsDrawer } from './components/RideDetailsDrawer'
import { RidesPage } from './components/RidesPage'
import { Toast } from './components/Toast'
import { VerificationPage } from './components/VerificationPage'
import { restoreSession, signOut } from './auth/localAuthGateway'
import { initialBookedRides, initialRiderApplications } from './data/fixtures'
import type {
  AdminSession,
  AdminView,
  BookedRide,
  RiderApplication,
} from './domain/admin'
import { hasPermission } from './domain/permissions'
import {
  reviewApplication,
  VerificationTransitionError,
} from './domain/riderVerification'
import './App.css'

interface ToastState {
  message: string
  tone: 'success' | 'error'
}

function App() {
  const [session, setSession] = useState<AdminSession | null>(() => restoreSession())
  const [activeView, setActiveView] = useState<AdminView>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [applications, setApplications] = useState<RiderApplication[]>(initialRiderApplications)
  const [selectedApplication, setSelectedApplication] = useState<RiderApplication | null>(null)
  const [selectedRide, setSelectedRide] = useState<BookedRide | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const pendingReviewCount = useMemo(
    () => applications.filter((application) => application.status === 'pending').length,
    [applications],
  )

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    function closeDrawer(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedApplication(null)
        setSelectedRide(null)
      }
    }

    window.addEventListener('keydown', closeDrawer)
    return () => window.removeEventListener('keydown', closeDrawer)
  }, [])

  function handleSignOut() {
    signOut()
    setSession(null)
    setActiveView('overview')
    setSearchQuery('')
  }

  function updateApplication(reviewedApplication: RiderApplication) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === reviewedApplication.id ? reviewedApplication : application,
      ),
    )
    setSelectedApplication(reviewedApplication)
  }

  function approveApplication(application: RiderApplication) {
    if (!session || !hasPermission(session.role, 'riders:review')) {
      setToast({ message: 'Your role cannot review rider applications.', tone: 'error' })
      return
    }

    try {
      const reviewedApplication = reviewApplication({
        application,
        nextStatus: 'approved',
        reviewNote: '',
        reviewedAt: new Date().toISOString(),
        reviewedBy: session.email,
      })
      updateApplication(reviewedApplication)
      setToast({ message: `${application.riderName} is now a verified rider.`, tone: 'success' })
    } catch (error) {
      setToast({
        message: error instanceof VerificationTransitionError ? error.message : 'The rider could not be approved.',
        tone: 'error',
      })
    }
  }

  function requestResubmission(application: RiderApplication, reviewNote: string) {
    if (!session || !hasPermission(session.role, 'riders:review')) {
      setToast({ message: 'Your role cannot review rider applications.', tone: 'error' })
      return
    }

    try {
      const reviewedApplication = reviewApplication({
        application,
        nextStatus: 'needs_resubmission',
        reviewNote,
        reviewedAt: new Date().toISOString(),
        reviewedBy: session.email,
      })
      updateApplication(reviewedApplication)
      setToast({ message: `A resubmission request was prepared for ${application.riderName}.`, tone: 'success' })
    } catch (error) {
      setToast({
        message: error instanceof VerificationTransitionError ? error.message : 'The resubmission request could not be prepared.',
        tone: 'error',
      })
    }
  }

  if (!session) {
    return <LoginScreen onSignedIn={setSession} />
  }

  return (
    <>
      <AdminShell
        session={session}
        activeView={activeView}
        pendingReviewCount={pendingReviewCount}
        searchQuery={searchQuery}
        onNavigate={setActiveView}
        onSearchChange={setSearchQuery}
        onSignOut={handleSignOut}
      >
        {activeView === 'overview' ? (
          <OverviewPage
            applications={applications}
            rides={initialBookedRides}
            onOpenApplication={setSelectedApplication}
            onOpenRide={setSelectedRide}
            onOpenVerification={() => setActiveView('verification')}
            onOpenRides={() => setActiveView('rides')}
          />
        ) : null}
        {activeView === 'verification' ? (
          <VerificationPage
            applications={applications}
            searchQuery={searchQuery}
            onSelectApplication={setSelectedApplication}
          />
        ) : null}
        {activeView === 'rides' ? (
          <RidesPage
            rides={initialBookedRides}
            searchQuery={searchQuery}
            onSelectRide={setSelectedRide}
          />
        ) : null}
      </AdminShell>

      {selectedApplication ? (
        <RiderReviewDrawer
          key={`${selectedApplication.id}-${selectedApplication.status}`}
          application={selectedApplication}
          canReview={hasPermission(session.role, 'riders:review')}
          onClose={() => setSelectedApplication(null)}
          onApprove={approveApplication}
          onRequestResubmission={requestResubmission}
        />
      ) : null}
      {selectedRide ? <RideDetailsDrawer ride={selectedRide} onClose={() => setSelectedRide(null)} /> : null}
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}
    </>
  )
}

export default App
