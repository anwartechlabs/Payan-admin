export type AdminRole = 'super_admin' | 'verification_admin' | 'operations_admin'

export type AdminPermission =
  | 'dashboard:view'
  | 'riders:review'
  | 'rides:monitor'

export interface AdminSession {
  email: string
  displayName: string
  role: AdminRole
}

export type AdminView = 'overview' | 'verification' | 'rides'

export type VerificationStatus =
  | 'pending'
  | 'approved'
  | 'needs_resubmission'

export type DocumentStatus = 'valid' | 'missing' | 'expired'

export interface RiderDocument {
  id: string
  label: string
  reference: string
  submittedAt: string | null
  status: DocumentStatus
}

export interface RiderApplication {
  id: string
  riderName: string
  email: string
  phone: string
  city: string
  vehicle: string
  plateNumber: string
  submittedAt: string
  status: VerificationStatus
  documents: RiderDocument[]
  reviewNote?: string
  reviewedAt?: string
  reviewedBy?: string
}

export type BookingStatus =
  | 'requested'
  | 'searching'
  | 'matched'
  | 'rider_en_route'
  | 'rider_arrived'
  | 'trip_started'
  | 'trip_completed'
  | 'cancelled'

export interface BookedRide {
  id: string
  passengerName: string
  passengerPhone: string
  riderName: string | null
  pickup: string
  pickupCoordinates: google.maps.LatLngLiteral
  destination: string
  destinationCoordinates: google.maps.LatLngLiteral
  riderCoordinates: google.maps.LatLngLiteral | null
  bookedAt: string
  status: BookingStatus
  vehicleType: string
  paymentMethod: string
  fareCentavos: number
  distanceKm: number
  etaMinutes: number | null
}
