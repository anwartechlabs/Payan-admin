import { useState } from 'react'
import {
  AlertCircle,
  Bike,
  Check,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { RiderApplication, RiderDocument } from '../domain/admin'
import { formatDateTime, getInitials, getVerificationStatusLabel } from '../domain/formatters'
import { hasCompleteDocuments } from '../domain/riderVerification'

interface RiderReviewDrawerProps {
  application: RiderApplication
  canReview: boolean
  onClose: () => void
  onApprove: (application: RiderApplication) => void
  onRequestResubmission: (application: RiderApplication, reviewNote: string) => void
}

export function RiderReviewDrawer({
  application,
  canReview,
  onClose,
  onApprove,
  onRequestResubmission,
}: RiderReviewDrawerProps) {
  const [selectedDocument, setSelectedDocument] = useState<RiderDocument>(application.documents[0])
  const [isResubmissionFormOpen, setIsResubmissionFormOpen] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const isPending = application.status === 'pending'
  const isApprovalAvailable = isPending && canReview && hasCompleteDocuments(application)

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="detail-drawer rider-review-drawer" role="dialog" aria-modal="true" aria-labelledby="rider-review-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="drawer-header">
          <div><span className="eyebrow">{application.id}</span><h2 id="rider-review-title">Rider application</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close rider review"><X size={20} /></button>
        </header>

        <div className="drawer-scroll-area">
          <section className="rider-identity-card">
            <span className="large-avatar">{getInitials(application.riderName)}</span>
            <div><h3>{application.riderName}</h3><span className={`verification-chip verification-${application.status}`}>{getVerificationStatusLabel(application.status)}</span></div>
          </section>

          <section className="drawer-section">
            <h3>Rider information</h3>
            <div className="detail-grid">
              <div><Mail size={16} /><span><small>Email</small><strong>{application.email}</strong></span></div>
              <div><Phone size={16} /><span><small>Phone</small><strong>{application.phone}</strong></span></div>
              <div><MapPin size={16} /><span><small>Service city</small><strong>{application.city}</strong></span></div>
              <div><Bike size={16} /><span><small>Vehicle</small><strong>{application.vehicle} · {application.plateNumber}</strong></span></div>
            </div>
          </section>

          <section className="drawer-section">
            <div className="drawer-section-heading"><div><h3>Submitted documents</h3><p>Select a record to inspect its verification state.</p></div><span>{application.documents.filter((document) => document.status === 'valid').length}/{application.documents.length} valid</span></div>
            <div className="document-review-layout">
              <div className="document-list">
                {application.documents.map((document) => (
                  <button key={document.id} type="button" className={selectedDocument.id === document.id ? 'document-row document-row-active' : 'document-row'} onClick={() => setSelectedDocument(document)}>
                    <span className={`document-status-icon document-${document.status}`}>
                      {document.status === 'valid' ? <Check size={15} /> : <AlertCircle size={15} />}
                    </span>
                    <span><strong>{document.label}</strong><small>{document.reference}</small></span>
                  </button>
                ))}
              </div>
              <div className="document-preview">
                <div className="document-sheet">
                  <span className="document-seal"><FileText size={23} /></span>
                  <strong>{selectedDocument.label.toUpperCase()}</strong>
                  <span className="redacted-line redacted-long" />
                  <span className="redacted-line redacted-medium" />
                  <span className="redacted-line redacted-short" />
                  <small>{selectedDocument.reference}</small>
                </div>
                <div className={`document-preview-status document-${selectedDocument.status}`}>
                  {selectedDocument.status === 'valid' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  {selectedDocument.status === 'valid' ? 'Document looks complete' : selectedDocument.status === 'expired' ? 'Document is expired' : 'Document is missing or unreadable'}
                </div>
              </div>
            </div>
          </section>

          {application.reviewedAt ? (
            <section className="audit-note">
              <ShieldCheck size={18} />
              <span><strong>Reviewed by {application.reviewedBy}</strong><small>{formatDateTime(application.reviewedAt)}</small><p>{application.reviewNote}</p></span>
            </section>
          ) : null}

          {isResubmissionFormOpen ? (
            <section className="resubmission-form">
              <label htmlFor="review-note">Reason for resubmission</label>
              <textarea id="review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Explain exactly which document needs attention." rows={4} />
              <small>Visible to the rider. Minimum 8 characters.</small>
            </section>
          ) : null}
        </div>

        <footer className="drawer-actions">
          {isPending && canReview ? (
            <>
              <button className="secondary-button" type="button" onClick={() => setIsResubmissionFormOpen((isOpen) => !isOpen)}><RotateCcw size={17} /> Request resubmission</button>
              {isResubmissionFormOpen ? (
                <button className="danger-button" type="button" onClick={() => onRequestResubmission(application, reviewNote)}>Send request</button>
              ) : (
                <button className="primary-button" type="button" disabled={!isApprovalAvailable} onClick={() => onApprove(application)}><CheckCircle2 size={18} /> Approve rider</button>
              )}
            </>
          ) : (
            <button className="primary-button full-width-button" type="button" onClick={onClose}>Done</button>
          )}
        </footer>
      </aside>
    </div>
  )
}
