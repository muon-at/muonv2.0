import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import '../styles/Modal.css';

interface Employee {
  id: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
  project?: string;
  slackName?: string;
  externalName?: string;
  tmgName?: string;
  employment_type?: string;
}

interface EditEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmployee: Employee) => void;
}

export default function EditEmployeeModal({ employee, isOpen, onClose, onSave }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<Employee>(employee || {} as Employee);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !employee) return null;

  const handleChange = (field: keyof Employee, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const empRef = doc(db, 'employees', formData.id);
      await updateDoc(empRef, {
        name: formData.name || '',
        email: formData.email || '',
        department: formData.department || '',
        role: formData.role || '',
        project: formData.project || '',
        slackName: formData.slackName || '',
        externalName: formData.externalName || '',
        tmgName: formData.tmgName || '',
        employment_type: formData.employment_type || '',
      });

      setSuccess(true);
      onSave(formData);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(`Feil ved lagring: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rediger ansatt</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">✅ Ansatt oppdatert!</div>}

          <div className="form-group">
            <label>Navn *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Fullt navn"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="epost@example.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rolle</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="f.eks owner, teamleder"
              />
            </div>
            <div className="form-group">
              <label>Avdeling</label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="f.eks OSL, KRS"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prosjekt</label>
              <input
                type="text"
                value={formData.project || ''}
                onChange={(e) => handleChange('project', e.target.value)}
                placeholder="f.eks Allente"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input
                type="text"
                value={formData.employment_type || ''}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                placeholder="f.eks Fulltid"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Slack Navn</label>
            <input
              type="text"
              value={formData.slackName || ''}
              onChange={(e) => handleChange('slackName', e.target.value)}
              placeholder="Slack displaynavn"
            />
          </div>

          <div className="form-group">
            <label>Ekstern Navn</label>
            <input
              type="text"
              value={formData.externalName || ''}
              onChange={(e) => handleChange('externalName', e.target.value)}
              placeholder="Navn for eksterne systemer"
            />
          </div>

          <div className="form-group">
            <label>TMG Navn</label>
            <input
              type="text"
              value={formData.tmgName || ''}
              onChange={(e) => handleChange('tmgName', e.target.value)}
              placeholder="Telemagic navn"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Avbryt
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      </div>
    </div>
  );
}
