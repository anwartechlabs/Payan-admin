import type { BookingStatus, VerificationStatus } from './admin'

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  hour: 'numeric',
  minute: '2-digit',
})

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

export function formatDateTime(isoTimestamp: string): string {
  return dateTimeFormatter.format(new Date(isoTimestamp))
}

export function formatTime(isoTimestamp: string): string {
  return timeFormatter.format(new Date(isoTimestamp))
}

export function formatCurrency(centavos: number): string {
  return currencyFormatter.format(centavos / 100)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    requested: 'Requested',
    searching: 'Finding rider',
    matched: 'Rider matched',
    rider_en_route: 'Rider en route',
    rider_arrived: 'Rider arrived',
    trip_started: 'In transit',
    trip_completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return labels[status]
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    pending: 'Pending review',
    approved: 'Approved',
    needs_resubmission: 'Needs resubmission',
  }

  return labels[status]
}
