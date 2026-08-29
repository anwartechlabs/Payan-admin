import { describe, expect, it } from 'vitest'
import type { RiderApplication } from './admin'
import {
  hasCompleteDocuments,
  reviewApplication,
  VerificationTransitionError,
} from './riderVerification'

function createApplication(
  overrides: Partial<RiderApplication> = {},
): RiderApplication {
  return {
    id: 'RDR-TEST',
    riderName: 'Test Rider',
    email: 'rider@example.com',
    phone: '+63 900 000 0000',
    city: 'Valencia City',
    vehicle: 'Test Motorcycle',
    plateNumber: 'TEST-01',
    submittedAt: '2026-08-29T08:00:00+08:00',
    status: 'pending',
    documents: [
      {
        id: 'license',
        label: 'Driver license',
        reference: 'DL-TEST',
        submittedAt: '2026-08-29T07:55:00+08:00',
        status: 'valid',
      },
    ],
    ...overrides,
  }
}

describe('rider verification transitions', () => {
  it('approves a pending application with complete documents', () => {
    const reviewedApplication = reviewApplication({
      application: createApplication(),
      nextStatus: 'approved',
      reviewNote: '',
      reviewedAt: '2026-08-29T10:00:00+08:00',
      reviewedBy: 'admin@payan.ph',
    })

    expect(reviewedApplication.status).toBe('approved')
    expect(reviewedApplication.reviewedBy).toBe('admin@payan.ph')
  })

  it('prevents approval when a required document is missing', () => {
    const application = createApplication({
      documents: [
        {
          id: 'license',
          label: 'Driver license',
          reference: 'No document submitted',
          submittedAt: null,
          status: 'missing',
        },
      ],
    })

    expect(hasCompleteDocuments(application)).toBe(false)
    expect(() => reviewApplication({
      application,
      nextStatus: 'approved',
      reviewNote: '',
      reviewedAt: '2026-08-29T10:00:00+08:00',
      reviewedBy: 'admin@payan.ph',
    })).toThrow(VerificationTransitionError)
  })

  it('requires a useful reason before requesting resubmission', () => {
    expect(() => reviewApplication({
      application: createApplication(),
      nextStatus: 'needs_resubmission',
      reviewNote: 'Short',
      reviewedAt: '2026-08-29T10:00:00+08:00',
      reviewedBy: 'admin@payan.ph',
    })).toThrow('at least 8 characters')
  })

  it('does not review an application twice', () => {
    expect(() => reviewApplication({
      application: createApplication({ status: 'approved' }),
      nextStatus: 'needs_resubmission',
      reviewNote: 'Upload a clearer file.',
      reviewedAt: '2026-08-29T10:00:00+08:00',
      reviewedBy: 'admin@payan.ph',
    })).toThrow('Only pending applications')
  })
})
