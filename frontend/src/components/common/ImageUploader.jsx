import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, CheckCircle2, AlertCircle, FileImage, RefreshCw } from 'lucide-react';

/**
 * Polished ImageUploader with real image support.
 * 
 * States: EMPTY → SELECTED → UPLOADING → SUCCESS → ERROR
 * 
 * The empty state shows a cute illustrated dropzone.
 * After selection, the REAL uploaded image is previewed.
 */
export default function ImageUploader({
  imagePreview,
  onImageSelected,
  onImageRemoved,
  label = 'Item Photo (Optional but Recommended)',
  helperText = 'Adding a clear photo helps our AI matching system find better matches ✨',
  uploadStatus = 'idle', // 'idle' | 'uploading' | 'success' | 'error'
  uploadError = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const fileInputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5 MB limit. Please select a smaller image.');
      return;
    }
    setFileName(file.name);
    setFileSize(formatSize(file.size));
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

  const handleRemove = () => {
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageRemoved();
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  // Determine visual state
  const isUploading = uploadStatus === 'uploading';
  const isSuccess = uploadStatus === 'success';
  const isError = uploadStatus === 'error';

  return (
    <div className="img-uploader-root">
      <div className="uploader-header">
        <label className="uploader-label">{label}</label>
        <span className="ai-hint-badge">
          <Sparkles size={12} /> AI Enhanced
        </span>
      </div>

      {imagePreview ? (
        /* ──── SELECTED / UPLOADING / SUCCESS / ERROR state ──── */
        <div className="preview-wrap fade-in">
          <div className="preview-image-area">
            <img src={imagePreview} alt="Item Preview" className="preview-img" />

            {/* Overlay for uploading state */}
            {isUploading && (
              <div className="preview-overlay uploading">
                <div className="upload-spinner" />
                <span>Uploading...</span>
              </div>
            )}

            {/* Top-right action buttons */}
            <div className="preview-actions">
              <button
                type="button"
                onClick={handleChangePhoto}
                className="preview-action-btn change"
                title="Change photo"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="preview-action-btn remove"
                title="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* File info bar */}
          <div className={`preview-info-bar ${isSuccess ? 'success' : ''} ${isError ? 'error' : ''}`}>
            <div className="file-info-left">
              <FileImage size={16} className="file-info-icon" />
              <div className="file-info-text">
                <span className="file-name">{fileName || 'Photo selected'}</span>
                {fileSize && <span className="file-size">{fileSize}</span>}
              </div>
            </div>
            <div className="file-status-right">
              {isUploading && (
                <span className="status-uploading">
                  <div className="mini-spinner" /> Uploading...
                </span>
              )}
              {isSuccess && (
                <span className="status-success">
                  <CheckCircle2 size={14} /> Photo added ✓
                </span>
              )}
              {isError && (
                <span className="status-error">
                  <AlertCircle size={14} /> {uploadError || 'Upload failed'}
                </span>
              )}
              {!isUploading && !isSuccess && !isError && (
                <span className="status-ready">
                  <CheckCircle2 size={14} /> Ready
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ──── EMPTY dropzone state ──── */
        <div
          className={`dropzone-box ${isDragging ? 'is-dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Cute illustrated empty upload doodle */}
          <div className="dropzone-doodle">
            <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="12" y="18" width="56" height="46" rx="14" fill="#FCE8DB" stroke="#E4DACB" strokeWidth="2" strokeDasharray="4 4" />
              {/* Photo frame outline */}
              <rect x="20" y="24" width="40" height="34" rx="8" fill="#FFFFFF" stroke="#F7B882" strokeWidth="1.5" />
              {/* Mountain landscape in photo */}
              <path d="M24 50 L34 38 L40 44 L50 32 L56 50Z" fill="#E06D53" fillOpacity="0.15" />
              <path d="M24 50 L34 42 L44 50Z" fill="#6D9775" fillOpacity="0.25" />
              {/* Sun */}
              <circle cx="48" cy="32" r="4" fill="#F4A261" fillOpacity="0.6" />
              {/* Plus icon overlay */}
              <circle cx="40" cy="40" r="10" fill="#FFFFFF" fillOpacity="0.85" />
              <path d="M40 35V45" stroke="#E06D53" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M35 40H45" stroke="#E06D53" strokeWidth="2.5" strokeLinecap="round" />
              {/* Cute corner sparkles */}
              <circle cx="18" cy="24" r="2.5" fill="#F4A261" />
              <path d="M60 20L61 16L62 20L66 21L62 22L61 26L60 22L56 21L60 20Z" fill="#E39D38" />
            </svg>
          </div>
          <p className="dropzone-title">Add a photo of your item</p>
          <p className="dropzone-text">
            <strong>Click to browse</strong> or drag and drop
          </p>
          <span className="dropzone-sub">PNG, JPG, or WEBP up to 5 MB • Clear photos help CampusFind find better matches ✨</span>
        </div>
      )}

      {/* Hidden file input (always rendered) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {helperText && !imagePreview && <p className="uploader-helper">{helperText}</p>}

      <style>{`
        .img-uploader-root {
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

        /* ──── Empty Dropzone ──── */
        .dropzone-box {
          border: 2px dashed var(--peach-400);
          border-radius: var(--radius-lg);
          background-color: #FFFDFB;
          padding: 2rem 1.25rem;
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
          box-shadow: var(--shadow-md);
        }
        .dropzone-doodle {
          margin-bottom: 0.5rem;
          transition: transform var(--transition-spring);
        }
        .dropzone-box:hover .dropzone-doodle {
          transform: scale(1.06) translateY(-2px);
        }
        .dropzone-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--charcoal-900);
          margin-bottom: 0.15rem;
        }
        .dropzone-text {
          font-size: 0.88rem;
          color: var(--charcoal-600);
          margin-bottom: 0.25rem;
        }
        .dropzone-sub {
          font-size: 0.76rem;
          color: var(--charcoal-400);
          line-height: 1.35;
        }

        /* ──── Preview State ──── */
        .preview-wrap {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1.5px solid var(--border-warm);
          background: #FFFFFF;
        }
        .preview-image-area {
          position: relative;
          width: 100%;
          height: 220px;
          background: var(--charcoal-900);
          overflow: hidden;
        }
        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .preview-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.88rem;
        }
        .preview-overlay.uploading {
          background: rgba(30, 34, 45, 0.55);
          backdrop-filter: blur(3px);
        }

        /* Action buttons */
        .preview-actions {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          display: flex;
          gap: 0.35rem;
        }
        .preview-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          backdrop-filter: blur(4px);
        }
        .preview-action-btn.change {
          background: rgba(255, 255, 255, 0.82);
          color: var(--charcoal-800);
        }
        .preview-action-btn.change:hover {
          background: #FFFFFF;
          color: var(--coral-500);
        }
        .preview-action-btn.remove {
          background: rgba(30, 34, 45, 0.7);
          color: #FFFFFF;
        }
        .preview-action-btn.remove:hover {
          background: #E63946;
        }

        /* File info bar */
        .preview-info-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.85rem;
          background: var(--cream-soft);
          border-top: 1px solid var(--border-subtle);
          gap: 0.75rem;
        }
        .preview-info-bar.success {
          background: #F0F8F2;
          border-top-color: rgba(109, 151, 117, 0.3);
        }
        .preview-info-bar.error {
          background: #FDF2F2;
          border-top-color: rgba(230, 57, 70, 0.25);
        }
        .file-info-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow: hidden;
        }
        .file-info-icon {
          color: var(--charcoal-400);
          flex-shrink: 0;
        }
        .file-info-text {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .file-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--charcoal-800);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        .file-size {
          font-size: 0.72rem;
          color: var(--charcoal-400);
        }
        .file-status-right {
          flex-shrink: 0;
        }
        .status-ready {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--sage-500);
        }
        .status-uploading {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--peach-500);
        }
        .status-success {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--sage-600);
        }
        .status-error {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: #E63946;
        }

        /* Spinners */
        .upload-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .mini-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(244, 162, 97, 0.3);
          border-top-color: var(--peach-500);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
