import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';

export default function ImageUploader({
  imagePreview,
  onImageSelected,
  onImageRemoved,
  label = 'Item Photo (Optional but Recommended)',
  helperText = 'Adding a clear photo helps our AI matching system achieve over 90% confidence.',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5 MB limit. Please select a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="image-uploader-group">
      <div className="uploader-header">
        <label className="uploader-label">{label}</label>
        <span className="ai-hint-badge">
          <Sparkles size={12} /> AI Enhanced
        </span>
      </div>

      {imagePreview ? (
        <div className="preview-container fade-in">
          <img src={imagePreview} alt="Item Preview" className="preview-img" />
          <button
            type="button"
            onClick={onImageRemoved}
            className="preview-remove-btn"
            title="Remove photo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`dropzone-box ${isDragging ? 'is-dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {/* Cute illustrated empty upload doodle */}
          <div className="dropzone-doodle">
            <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="12" y="18" width="56" height="46" rx="14" fill="#FCE8DB" stroke="#E4DACB" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="40" cy="40" r="14" fill="#FFFFFF" />
              <circle cx="40" cy="40" r="10" fill="#E06D53" fillOpacity="0.2" />
              <path d="M40 32V48" stroke="#E06D53" strokeWidth="3" strokeLinecap="round" />
              <path d="M32 40H48" stroke="#E06D53" strokeWidth="3" strokeLinecap="round" />
              {/* Cute corner photo sparkles */}
              <circle cx="24" cy="28" r="3" fill="#F4A261" />
              <path d="M58 24L59 20L60 24L64 25L60 26L59 30L58 26L54 25L58 24Z" fill="#E39D38" />
            </svg>
          </div>
          <p className="dropzone-text">
            <strong>Click to upload</strong> or drag and drop a snapshot
          </p>
          <span className="dropzone-sub">PNG, JPG, or WEBP up to 5 MB</span>
        </div>
      )}

      {helperText && <p className="uploader-helper">{helperText}</p>}

      <style>{`
        .image-uploader-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }
        .uploader-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4rem;
        }
        .uploader-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal-800);
        }
        .ai-hint-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #934612;
          background: var(--peach-200);
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-pill);
        }
        .dropzone-box {
          border: 2px dashed var(--peach-400);
          border-radius: var(--radius-lg);
          background-color: #FFFDFB;
          padding: 1.75rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }
        .dropzone-box:hover, .dropzone-box.is-dragging {
          border-color: var(--coral-500);
          background-color: var(--coral-50);
          transform: translateY(-2px);
        }
        .dropzone-doodle {
          margin-bottom: 0.65rem;
        }
        .dropzone-text {
          font-size: 0.92rem;
          color: var(--charcoal-800);
          margin-bottom: 0.2rem;
        }
        .dropzone-sub {
          font-size: 0.78rem;
          color: var(--charcoal-400);
        }
        .preview-container {
          position: relative;
          width: 100%;
          max-height: 220px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1.5px solid var(--border-warm);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--charcoal-900);
        }
        .preview-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }
        .preview-remove-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(30, 34, 45, 0.75);
          color: #FFFFFF;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          backdrop-filter: blur(4px);
        }
        .preview-remove-btn:hover {
          background: #E63946;
        }
        .uploader-helper {
          font-size: 0.78rem;
          color: var(--charcoal-400);
          margin-top: 0.35rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
