import React from 'react';
import { CheckCircle2, Clock, XCircle, Sparkles, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export default function StatusBadge({ status, type = 'status', size = 'sm', className = '' }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeClass = 'badge-charcoal';
  let Icon = Clock;
  let label = status;

  if (normalized === 'open') {
    badgeClass = 'badge-coral';
    Icon = Clock;
    label = 'Open Report';
  } else if (normalized === 'matched') {
    badgeClass = 'badge-peach';
    Icon = Sparkles;
    label = 'Match Found ✨';
  } else if (normalized === 'confirmed' || normalized === 'approved' || normalized === 'returned') {
    badgeClass = 'badge-sage';
    Icon = CheckCircle2;
    label = status === 'returned' ? 'Item Returned' : status;
  } else if (normalized === 'claimed') {
    badgeClass = 'badge-blue';
    Icon = ArrowRightLeft;
    label = 'Claim Active';
  } else if (normalized === 'pending') {
    badgeClass = 'badge-yellow';
    Icon = Clock;
    label = 'Pending Review';
  } else if (normalized === 'rejected' || normalized === 'closed') {
    badgeClass = 'badge-charcoal';
    Icon = XCircle;
    label = status;
  } else if (normalized === 'verified') {
    badgeClass = 'badge-sage';
    Icon = ShieldCheck;
    label = 'Admin Verified';
  } else if (normalized === 'unverified') {
    badgeClass = 'badge-yellow';
    Icon = Clock;
    label = 'Verification Pending';
  }

  return (
    <span className={`badge ${badgeClass} ${size === 'lg' ? 'badge-lg' : ''} ${className}`}>
      <Icon size={size === 'lg' ? 14 : 12} />
      <span>{label}</span>
      <style>{`
        .badge-lg {
          padding: 0.35rem 0.95rem;
          font-size: 0.85rem;
        }
      `}</style>
    </span>
  );
}
