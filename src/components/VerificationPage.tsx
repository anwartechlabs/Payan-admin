import { CheckCircle2, ChevronRight, Clock3, FileCheck2, Filter, RotateCcw, SearchX } from 'lucide-react'
import { useState } from 'react'
import type { RiderApplication, VerificationStatus } from '../domain/admin'
import { formatDateTime, getInitials, getVerificationStatusLabel } from '../domain/formatters'

type VerificationFilter = 'all' | VerificationStatus

interface VerificationPageProps {
  applications: RiderApplication[]
  searchQuery: string
  onSelectApplication: (application: RiderApplication) => void
}

const filterOptions: Array<{ value: VerificationFilter; label: string }> = [
  { value: 'all', label: 'All applications' },
  { value: 'pending', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'needs_resubmission', label: 'Needs resubmission' },
]

export function VerificationPage({
  applications,
  searchQuery,
  onSelectApplication,
}: VerificationPageProps) {
  const [filter, setFilter] = useState<VerificationFilter>('pending')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredApplications = applications.filter((application) => {
    const matchesFilter = filter === 'all' || application.status === filter
    const searchableText = [
      application.id,
      application.riderName,
      application.email,
      application.phone,
      application.vehicle,
      application.plateNumber,
    ].join(' ').toLowerCase()
    return matchesFilter && searchableText.includes(normalizedQuery)
  })

  return (
    <div className="page-content">
      <section className="page-heading verification-heading">
        <div>
          <p className="eyebrow">TRUST &amp; SAFETY</p>
          <h1>Rider verification</h1>
          <p>Review rider identities, vehicle records, and eligibility documents.</p>
        </div>
        <div className="heading-stat">
          <span>Pending queue</span>
          <strong>{applications.filter((application) => application.status === 'pending').length}</strong>
        </div>
      </section>

      <section className="panel data-panel">
        <div className="table-toolbar">
          <div className="segmented-filter" aria-label="Application status filter">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filter === option.value ? 'segment-active' : ''}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
                <span>{option.value === 'all' ? applications.length : applications.filter((application) => application.status === option.value).length}</span>
              </button>
            ))}
          </div>
          <div className="toolbar-summary"><Filter size={15} /> {filteredApplications.length} results</div>
        </div>

        {filteredApplications.length ? (
          <div className="application-table" role="table" aria-label="Rider applications">
            <div className="application-table-header" role="row">
              <span>Rider</span><span>Vehicle</span><span>Documents</span><span>Submitted</span><span>Status</span><span aria-hidden="true" />
            </div>
            {filteredApplications.map((application) => {
              const validDocuments = application.documents.filter((document) => document.status === 'valid').length
              return (
                <button
                  type="button"
                  className="application-table-row"
                  role="row"
                  key={application.id}
                  onClick={() => onSelectApplication(application)}
                >
                  <span className="application-identity">
                    <span className="rider-avatar">{getInitials(application.riderName)}</span>
                    <span><strong>{application.riderName}</strong><small>{application.id} · {application.city}</small></span>
                  </span>
                  <span><strong>{application.vehicle}</strong><small>{application.plateNumber}</small></span>
                  <span className="document-progress">
                    <span className="document-progress-track"><span style={{ width: `${(validDocuments / application.documents.length) * 100}%` }} /></span>
                    <small>{validDocuments} of {application.documents.length} valid</small>
                  </span>
                  <span><strong>{formatDateTime(application.submittedAt)}</strong><small><Clock3 size={12} /> Asia/Manila</small></span>
                  <span><span className={`verification-chip verification-${application.status}`}>{getVerificationStatusLabel(application.status)}</span></span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            {searchQuery ? <SearchX size={28} /> : filter === 'pending' ? <CheckCircle2 size={28} /> : <FileCheck2 size={28} />}
            <strong>{searchQuery ? 'No matching applications' : 'Nothing in this view'}</strong>
            <span>Try another search or status filter.</span>
            <button type="button" className="secondary-button" onClick={() => setFilter('all')}><RotateCcw size={16} /> Show all applications</button>
          </div>
        )}
      </section>
    </div>
  )
}
