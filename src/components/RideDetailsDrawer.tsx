import {
  Bike,
  Check,
  CircleUserRound,
  Clock3,
  CreditCard,
  MapPin,
  Navigation,
  Phone,
  Route,
  X,
} from 'lucide-react'
import type { BookedRide, BookingStatus } from '../domain/admin'
import { formatCurrency, formatDateTime, getBookingStatusLabel, getInitials } from '../domain/formatters'

interface RideDetailsDrawerProps {
  ride: BookedRide
  onClose: () => void
}

const rideStages: Array<{ status: BookingStatus; label: string }> = [
  { status: 'requested', label: 'Ride requested' },
  { status: 'searching', label: 'Finding a rider' },
  { status: 'matched', label: 'Rider matched' },
  { status: 'rider_en_route', label: 'Rider en route' },
  { status: 'rider_arrived', label: 'Rider arrived' },
  { status: 'trip_started', label: 'Trip started' },
  { status: 'trip_completed', label: 'Trip completed' },
]

export function RideDetailsDrawer({ ride, onClose }: RideDetailsDrawerProps) {
  const currentStageIndex = rideStages.findIndex((stage) => stage.status === ride.status)

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-drawer ride-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="ride-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="drawer-header">
          <div><span className="eyebrow">{ride.id}</span><h2 id="ride-detail-title">Booking details</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close ride details"><X size={20} /></button>
        </header>

        <div className="drawer-scroll-area">
          <section className="ride-detail-hero">
            <div><span className={`status-chip status-${ride.status}`}><span />{getBookingStatusLabel(ride.status)}</span><h3>{ride.pickup}</h3><div className="route-divider"><span /><i /><span /></div><h3>{ride.destination}</h3></div>
            <div className="ride-eta"><small>{ride.etaMinutes === null ? 'Final state' : 'Estimated arrival'}</small><strong>{ride.etaMinutes === null ? '—' : `${ride.etaMinutes} min`}</strong></div>
          </section>

          <section className="drawer-section">
            <h3>People on this booking</h3>
            <div className="people-grid">
              <div className="person-card">
                <span className="large-avatar small-large-avatar">{getInitials(ride.passengerName)}</span>
                <span><small>Passenger</small><strong>{ride.passengerName}</strong><span><Phone size={13} /> {ride.passengerPhone}</span></span>
              </div>
              <div className="person-card">
                <span className="large-avatar small-large-avatar rider-person-avatar">{ride.riderName ? getInitials(ride.riderName) : <Bike size={19} />}</span>
                <span><small>Rider</small><strong>{ride.riderName ?? 'Finding a rider'}</strong><span><CircleUserRound size={13} /> {ride.riderName ? 'Verified account' : 'Not assigned'}</span></span>
              </div>
            </div>
          </section>

          <section className="drawer-section">
            <h3>Ride summary</h3>
            <div className="detail-grid ride-summary-grid">
              <div><Clock3 size={16} /><span><small>Booked</small><strong>{formatDateTime(ride.bookedAt)}</strong></span></div>
              <div><Route size={16} /><span><small>Distance</small><strong>{ride.distanceKm.toFixed(1)} km</strong></span></div>
              <div><CreditCard size={16} /><span><small>Payment</small><strong>{ride.paymentMethod}</strong></span></div>
              <div><Navigation size={16} /><span><small>Fare</small><strong>{formatCurrency(ride.fareCentavos)}</strong></span></div>
            </div>
          </section>

          <section className="drawer-section">
            <h3>Booking timeline</h3>
            {ride.status === 'cancelled' ? (
              <div className="cancelled-timeline"><X size={16} /><span><strong>Booking cancelled</strong><small>The request ended before a trip started.</small></span></div>
            ) : (
              <div className="ride-timeline">
                {rideStages.map((stage, index) => {
                  const isComplete = index <= currentStageIndex
                  const isCurrent = index === currentStageIndex
                  return (
                    <div className={`timeline-step ${isComplete ? 'timeline-step-complete' : ''} ${isCurrent ? 'timeline-step-current' : ''}`} key={stage.status}>
                      <span>{isComplete ? <Check size={13} /> : null}</span>
                      <div><strong>{stage.label}</strong>{isCurrent ? <small>Current status</small> : null}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="privacy-note"><MapPin size={17} /><span><strong>Location privacy</strong>Precise coordinates are intentionally omitted from this operational prototype.</span></section>
        </div>

        <footer className="drawer-actions"><button className="primary-button full-width-button" type="button" onClick={onClose}>Close details</button></footer>
      </aside>
    </div>
  )
}
