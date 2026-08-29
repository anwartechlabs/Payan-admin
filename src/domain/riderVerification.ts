import type {
  RiderApplication,
  VerificationStatus,
} from './admin'

export class VerificationTransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VerificationTransitionError'
  }
}

export function hasCompleteDocuments(application: RiderApplication): boolean {
  return application.documents.every((document) => document.status === 'valid')
}

interface ReviewApplicationInput {
  application: RiderApplication
  nextStatus: Extract<VerificationStatus, 'approved' | 'needs_resubmission'>
  reviewNote: string
  reviewedAt: string
  reviewedBy: string
}

export function reviewApplication({
  application,
  nextStatus,
  reviewNote,
  reviewedAt,
  reviewedBy,
}: ReviewApplicationInput): RiderApplication {
  if (application.status !== 'pending') {
    throw new VerificationTransitionError(
      'Only pending applications can be reviewed.',
    )
  }

  if (nextStatus === 'approved' && !hasCompleteDocuments(application)) {
    throw new VerificationTransitionError(
      'All required documents must be valid before approval.',
    )
  }

  const normalizedNote = reviewNote.trim()
  if (nextStatus === 'needs_resubmission' && normalizedNote.length < 8) {
    throw new VerificationTransitionError(
      'Add a clear resubmission note with at least 8 characters.',
    )
  }

  return {
    ...application,
    status: nextStatus,
    reviewNote: normalizedNote || 'Documents verified and approved.',
    reviewedAt,
    reviewedBy,
  }
}
