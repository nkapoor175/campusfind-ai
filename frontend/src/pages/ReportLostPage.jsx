import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, Tag, AlertCircle, ArrowLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import ImageUploader from '../components/common/ImageUploader';
import { CAMPUS_CATEGORIES, CAMPUS_LOCATIONS } from '../services/seedData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BackpackIllustration } from '../assets/illustrations/IllustratedIcons';

export default function ReportLostPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Accessories',
    brand: '',
    color: 'Blue',
    description: '',
    dateLost: new Date().toISOString().split('T')[0],
    lostLocation: 'Central Library',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelected = (file, previewUrl) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
  };

  const handleImageRemoved = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.itemName.trim()) {
      setError('Item Name is required');
      return;
    }

    setLoading(true);
    try {
      const createdItem = await api.createLostItem({
        itemName: formData.itemName,
        category: formData.category,
        brand: formData.brand,
        color: formData.color,
        description: formData.description,
        dateLost: formData.dateLost,
        lostLocation: formData.lostLocation,
        studentId: user?.StudentID || 2,
        imagePreview: imagePreview,
      });

      // If an actual image file was selected, upload via backend upload endpoint
      if (selectedFile && createdItem?.LostID) {
        try {
          await api.uploadLostImage(createdItem.LostID, selectedFile);
        } catch (uploadErr) {
          console.warn('Image upload note:', uploadErr);
        }
      }

      toast.success('Lost item report created! AI is now actively scanning campus matches.');
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit lost item report');
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-lost-page fade-in">
      <div className="app-container report-container-inner">
        {/* Back Link */}
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
              <BackpackIllustration size={72} />
            </div>
            <div>
              <span className="report-badge">Lost Item Report</span>
              <h1 className="report-title">Tell Us What Went Missing</h1>
              <p className="report-desc">
                Provide as many descriptive details as you remember. Our AI uses colors, locations, and descriptions to compute live candidate matches.
              </p>
            </div>
          </div>

          {error && <div className="report-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="report-form">
            {/* Primary Details Row */}
            <div className="form-two-col">
              <Input
                label="Item Name"
                placeholder="e.g. Milton Blue Steel Flask, boAt Wired Earphones"
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
                label="Brand / Manufacturer (Optional)"
                placeholder="e.g. Milton, Casio, Apple, Wildcraft"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />

              <Input
                label="Primary Color"
                placeholder="e.g. Blue, Matte Black, Silver, Navy"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
              />
            </div>

            <div className="form-two-col">
              <Select
                label="Last Seen Campus Location"
                value={formData.lostLocation}
                onChange={(e) => handleChange('lostLocation', e.target.value)}
                options={CAMPUS_LOCATIONS}
              />

              <Input
                label="Date Lost"
                type="date"
                required
                value={formData.dateLost}
                onChange={(e) => handleChange('dateLost', e.target.value)}
              />
            </div>

            {/* Description textarea */}
            <div className="input-group">
              <label className="input-label">Detailed Description &amp; Marks</label>
              <textarea
                rows={3}
                placeholder="Describe stickers, scratches, pouches, keychains, scratches, or contents inside..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="description-textarea"
              />
              <span className="input-helper-msg">
                Specific markings greatly boost the AI similarity score!
              </span>
            </div>

            {/* Image Uploader */}
            <ImageUploader
              imagePreview={imagePreview}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              label="Item Photo (Optional)"
              helperText="Upload a photo of the item or a similar reference image to assist AI feature matching."
            />

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full submit-report-btn"
            >
              Report Lost Item
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        .report-lost-page {
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
          color: var(--coral-500);
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
          filter: drop-shadow(0 6px 14px rgba(224, 109, 83, 0.15));
        }
        .report-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--coral-500);
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
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3.5px rgba(224, 109, 83, 0.14);
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
