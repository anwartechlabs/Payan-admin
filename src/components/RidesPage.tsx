import { ChevronRight, Filter, MapPinned, SearchX } from 'lucide-react'
import { useState } from 'react'
import type { BookedRide, BookingStatus } from '../domain/admin'
import { formatCurrency, formatTime, getBookingStatusLabel, getInitials } from '../domain/formatters'
import { GoogleRideMap } from './GoogleRideMap'

type RideFilter = 'all' | 'active' | 'trip_completed' | 'cancelled'

interface RidesPageProps {
  rides: BookedRide[]
  searchQuery: string
  onSelectRide: (ride: BookedRide) => void
}

const inactiveStatuses = new Set<BookingStatus>(['trip_completed', 'cancelled'])

const filterOptions: Array<{ value: RideFilter; label: string }> = [
  { value: 'all', label: 'All rides' },
  { value: 'active', label: 'Active' },
  { value: 'trip_completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function RidesPage({ rides, searchQuery, onSelectRide }: RidesPageProps) {
  const [filter, setFilter] = useState<RideFilter>('active')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const activeRides = rides.filter((ride) => !inactiveStatuses.has(ride.status))
  const filteredRides = rides.filter((ride) => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' && !inactiveStatuses.has(ride.status))
      || ride.status === filter
    const searchableText = [ride.id, ride.passengerName, ride.riderName, ride.pickup, ride.destination].join(' ').toLowerCase()
    return matchesFilter && searchableText.includes(normalizedQuery)
  })

  function countForFilter(filterValue: RideFilter): number {
    if (filterValue === 'all') return rides.length
    if (filterValue === 'active') return activeRides.length
    return rides.filter((ride) => ride.status === filterValue).length
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">BOOKING OPERATIONS</p>
          <h1>Live ride monitor</h1>
          <p>Follow active bookings and inspect the passenger-to-rider assignment.</p>
        </div>
        <div className="live-ride-counter"><span className="pulse-dot" /><strong>{activeRides.length}</strong> live rides</div>
      </section>

      <section className="ride-monitor-grid">
        <GoogleRideMap rides={activeRides} variant="full" onSelectRide={onSelectRide} />

        <article className="panel live-summary-panel">
          <span className="section-kicker">LIVE SNAPSHOT</span>
          <h2>Current movement</h2>
          <div className="live-summary-metric"><span>In transit</span><strong>{rides.filter((ride) => ride.status === 'trip_started').length}</strong></div>
          <div className="live-summary-metric"><span>Rider en route</span><strong>{rides.filter((ride) => ride.status === 'rider_en_route').length}</strong></div>
          <div className="live-summary-metric"><span>Finding a rider</span><strong>{rides.filter((ride) => ride.status === 'searching').length}</strong></div>
          <div className="live-summary-callout"><MapPinned size={18} /><span><strong>Valencia service area</strong>All monitored rides are within the expected operating zone.</span></div>
        </article>
      </section>

      <section className="panel data-panel rides-data-panel">
        <div className="table-toolbar">
          <div className="segmented-filter" aria-label="Ride status filter">
            {filterOptions.map((option) => (
              <button key={option.value} type="button" className={filter === option.value ? 'segment-active' : ''} onClick={() => setFilter(option.value)}>
                {option.label}<span>{countForFilter(option.value)}</span>
              </button>
            ))}
          </div>
          <div className="toolbar-summary"><Filter size={15} /> {filteredRides.length} results</div>
        </div>

        {filteredRides.length ? (
          <div className="bookings-table" role="table" aria-label="Booked rides">
            <div className="bookings-table-header" role="row"><span>Booking</span><span>Passenger</span><span>Rider</span><span>Route</span><span>Fare</span><span>Status</span><span /></div>
            {filteredRides.map((ride) => (
              <button type="button" className="bookings-table-row" role="row" key={ride.id} onClick={() => onSelectRide(ride)}>
                <span><strong className="ride-id">{ride.id}</strong><small>{formatTime(ride.bookedAt)}</small></span>
                <span className="mini-identity"><span className="mini-avatar">{getInitials(ride.passengerName)}</span><span><strong>{ride.passengerName}</strong><small>Passenger</small></span></span>
                <span><strong>{ride.riderName ?? 'Not assigned'}</strong><small>{ride.riderName ? 'Verified rider' : 'Matching'}</small></span>
                <span><strong>{ride.pickup}</strong><small>to {ride.destination}</small></span>
                <span><strong>{formatCurrency(ride.fareCentavos)}</strong><small>{ride.paymentMethod}</small></span>
                <span><span className={`status-chip status-${ride.status}`}><span />{getBookingStatusLabel(ride.status)}</span></span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state"><SearchX size={28} /><strong>No matching rides</strong><span>Try another search or status filter.</span></div>
        )}
      </section>
    </div>
  )
}
