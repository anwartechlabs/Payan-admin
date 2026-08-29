import {
  Activity,
  Bike,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'
import type { BookedRide, RiderApplication } from '../domain/admin'
import { GoogleRideMap } from './GoogleRideMap'
import {
  formatCurrency,
  formatTime,
  getBookingStatusLabel,
  getInitials,
} from '../domain/formatters'

interface OverviewPageProps {
  applications: RiderApplication[]
  rides: BookedRide[]
  onOpenApplication: (application: RiderApplication) => void
  onOpenRide: (ride: BookedRide) => void
  onOpenVerification: () => void
  onOpenRides: () => void
}

const activeRideStatuses = new Set([
  'requested',
  'searching',
  'matched',
  'rider_en_route',
  'rider_arrived',
  'trip_started',
])

export function OverviewPage({
  applications,
  rides,
  onOpenApplication,
  onOpenRide,
  onOpenVerification,
  onOpenRides,
}: OverviewPageProps) {
  const pendingApplications = applications.filter((application) => application.status === 'pending')
  const activeRides = rides.filter((ride) => activeRideStatuses.has(ride.status))
  const visibleApplications = pendingApplications.slice(0, 3)
  const visibleRides = activeRides.slice(0, 3)
  const capturedFare = rides
    .filter((ride) => ride.status === 'trip_completed')
    .reduce((total, ride) => total + ride.fareCentavos, 0)

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">SATURDAY, 29 AUGUST</p>
          <h1>Operations overview</h1>
          <p>Monitor today’s rides and review new rider applications.</p>
        </div>
        <button className="primary-button" type="button" onClick={onOpenVerification}>
          <FileCheck2 size={19} aria-hidden="true" /> Review documents
        </button>
      </section>

      <section className="metrics-grid" aria-label="Operations summary">
        <article className="metric-card featured-metric">
          <div className="metric-icon"><Activity size={20} aria-hidden="true" /></div>
          <span>Active rides</span>
          <strong>{activeRides.length}</strong>
          <small><b>Live</b> across the service area</small>
        </article>
        <article className="metric-card">
          <div className="metric-icon"><FileCheck2 size={20} aria-hidden="true" /></div>
          <span>Pending reviews</span>
          <strong>{pendingApplications.length}</strong>
          <small><b>{visibleApplications.length} ready</b> for immediate review</small>
        </article>
        <article className="metric-card">
          <div className="metric-icon"><Bike size={20} aria-hidden="true" /></div>
          <span>Riders online</span>
          <strong>47</strong>
          <small>68% of verified riders</small>
        </article>
        <article className="metric-card">
          <div className="metric-icon"><CheckCircle2 size={20} aria-hidden="true" /></div>
          <span>Captured fare</span>
          <strong>{formatCurrency(capturedFare)}</strong>
          <small>From completed fixture rides</small>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="panel verification-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">ACTION NEEDED</span>
              <h2>Rider verification queue</h2>
            </div>
            <button type="button" className="text-button" onClick={onOpenVerification}>View all <ChevronRight size={16} /></button>
          </div>
          <div className="queue-list">
            {visibleApplications.length ? visibleApplications.map((application) => {
              const validDocumentCount = application.documents.filter((document) => document.status === 'valid').length
              return (
                <button className="queue-row" key={application.id} type="button" onClick={() => onOpenApplication(application)}>
                  <span className="rider-avatar">{getInitials(application.riderName)}</span>
                  <span className="rider-details">
                    <strong>{application.riderName}</strong>
                    <small><Clock3 size={13} /> Submitted {formatTime(application.submittedAt)}</small>
                  </span>
                  <span className="document-count">
                    <small>Documents</small>
                    <strong>{validDocumentCount} of {application.documents.length}</strong>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              )
            }) : (
              <div className="empty-state compact-empty"><CheckCircle2 size={22} /><strong>Queue cleared</strong><span>No applications are waiting for review.</span></div>
            )}
          </div>
          <div className="queue-footer">
            <ShieldCheck size={17} aria-hidden="true" />
            Reviews are recorded in the verification audit log.
          </div>
        </article>

        <article className="panel rides-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">LIVE NOW</span>
              <h2>Booked rides</h2>
            </div>
            <button type="button" className="text-button" onClick={onOpenRides}>Open monitor <ChevronRight size={16} /></button>
          </div>
          <GoogleRideMap rides={activeRides} variant="compact" onSelectRide={onOpenRide} />
          <div className="rides-table" role="table" aria-label="Active rides">
            {visibleRides.map((ride) => (
              <button className="ride-row" role="row" key={ride.id} type="button" onClick={() => onOpenRide(ride)}>
                <span className="ride-id">{ride.id}</span>
                <span><strong>{ride.passengerName}</strong><small>{ride.pickup} → {ride.destination}</small></span>
                <span className="ride-rider"><strong>{ride.riderName ?? 'Awaiting match'}</strong><small>Assigned rider</small></span>
                <span className={`status-chip status-${ride.status}`}><span />{getBookingStatusLabel(ride.status)}</span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
