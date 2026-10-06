import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import ImageUploader from '../components/common/ImageUploader';
import { CAMPUS_CATEGORIES, CAMPUS_LOCATIONS } from '../services/seedData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { WaterBottleIllustration } from '../assets/illustrations/IllustratedIcons';

export default function ReportFoundPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Accessories',
    brand: '',
    color: 'Blue',
    description: '',
    dateFound: new Date().toISOString().split('T')[0],
    foundLocation: 'Central Library',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelected = (file, previewUrl) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleImageRemoved = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.itemName.trim()) {
      setError('Item Name is required');
      return;
    }

    setLoading(true);
    if (selectedFile) {
      setUploadStatus('uploading');
    }

    try {
      const createdItem = await api.createFoundItem({
        itemName: formData.itemName,
        category: formData.category,
        brand: formData.brand,
        color: formData.color,
        description: formData.description,
        dateFound: formData.dateFound,
        foundLocation: formData.foundLocation,
        studentId: user?.StudentID || 2,
        imagePreview: imagePreview,
      });

      if (selectedFile && createdItem?.FoundID) {
        try {
          await api.uploadFoundImage(createdItem.FoundID, selectedFile);
          setUploadStatus('success');
        } catch (uploadErr) {
          console.warn('Image upload note:', uploadErr);
          setUploadStatus('error');
          setUploadError(uploadErr.message || 'Image upload failed');
        }
      }

      toast.success('Thank you! Found item logged and added to campus registry.');
      onNavigate('found-items');
    } catch (err) {
      setError(err.message || 'Failed to submit found item report');
      setUploadStatus('error');
      setUploadError(err.message || 'Submission failed');
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-found-page fade-in">
      <div className="app-container report-container-inner">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="back-nav-btn pressable"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="report-card blob-card-1">
          {/* Header */}
          <div className="report-header">
            <div className="header-art animate-float">
              <WaterBottleIllustration size={72} />
            </div>
            <div>
              <span className="report-badge sage">You’re a Campus Hero 🌟</span>
              <h1 className="report-title">Report a Found Item</h1>
              <p className="report-desc">
                Log the item you discovered on campus. Our automated matcher will connect with the rightful student owner.
              </p>
            </div>
          </div>

          {error && <div className="report-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-two-col">
              <Input
                label="Item Name"
                placeholder="e.g. Steel Water Bottle, Wireless Earbuds, Student ID"
                required
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
              />

              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={CAMPUS_CATEGORIES.filter((c) => c !== 'All Categories')}
              />
            </div>

            <div className="form-two-col">
              <Input
                label="Brand / Label (if visible)"
                placeholder="e.g. Milton, Casio, Sony, Wildcraft"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />

              <Input
                label="Primary Color"
                placeholder="e.g. Blue, Black, Silver, Yellow"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
              />
            </div>

            <div className="form-two-col">
              <Select
                label="Campus Location Found"
                value={formData.foundLocation}
                onChange={(e) => handleChange('foundLocation', e.target.value)}
                options={CAMPUS_LOCATIONS}
              />

              <Input
                label="Date Found"
                type="date"
                required
                value={formData.dateFound}
                onChange={(e) => handleChange('dateFound', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Condition &amp; Distinguishing Details</label>
              <textarea
                rows={3}
                placeholder="Mention stickers, keyrings, specific dents, or safe custody location (e.g. handed to Library reception desk)..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="description-textarea"
              />
            </div>

            <ImageUploader
              imagePreview={imagePreview}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              uploadStatus={uploadStatus}
              uploadError={uploadError}
              label="Photo of Found Item"
              helperText="Snap a picture of the item right where it was found."
            />

            <Button
              type="submit"
              variant="sage"
              size="lg"
              loading={loading}
              className="w-full submit-report-btn"
            >
              Report Found Item
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        .report-found-page {
          padding: 2rem 0;
          text-align: left;
        }
        .report-container-inner {
          max-width: 760px;
        }
        .back-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          border: none;
          color: var(--charcoal-600);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          margin-bottom: 1rem;
        }
        .back-nav-btn:hover {
          color: var(--sage-600);
        }
        .report-card {
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }
        .report-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 1.5rem;
        }
        .header-art {
          flex-shrink: 0;
          filter: drop-shadow(0 6px 14px rgba(109, 151, 117, 0.15));
        }
        .report-badge.sage {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--sage-600);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.25rem;
        }
        .report-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--charcoal-900);
          margin-bottom: 0.35rem;
        }
        .report-desc {
          font-size: 0.92rem;
          color: var(--charcoal-600);
          margin: 0;
          line-height: 1.5;
        }
        .report-error-alert {
          background: #FDF2F2;
          border-left: 4px solid #E63946;
          color: #E63946;
          padding: 0.65rem 0.95rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .form-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .description-textarea {
          width: 100%;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.95rem;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--charcoal-900);
          outline: none;
          resize: vertical;
          transition: border-color 0.15s;
        }
        .description-textarea:focus {
          border-color: var(--sage-500);
          box-shadow: 0 0 0 3.5px rgba(109, 151, 117, 0.18);
        }
        .submit-report-btn {
          margin-top: 1rem;
        }
        @media (max-width: 650px) {
          .report-card { padding: 1.5rem; }
          .report-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .form-two-col { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
