import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Input from '../common/Input';
import Button from '../common/Button';

export default function ReportActions({ item, type, onUpdated }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({ itemName: item.ItemName || '', category: item.Category || '', brand: item.Brand || '', color: item.Color || '', description: item.Description || '', [type === 'lost' ? 'lostLocation' : 'foundLocation']: (type === 'lost' ? item.LostLocation : item.FoundLocation) || '', [type === 'lost' ? 'dateLost' : 'dateFound']: ((type === 'lost' ? item.DateLost : item.DateFound) || '').slice(0, 10) });
  const update = async (changes) => {
    setSaving(true);
    try {
      await api.updateReport(type, type === 'lost' ? item.LostID : item.FoundID, changes);
      toast.success(changes.action === 'close' ? 'Report closed' : 'Report updated. Security will verify it again.');
      onUpdated();
    } catch (err) { toast.error(err.message || 'Failed to update report'); }
    finally { setSaving(false); }
  };
  if (item.Status !== 'Open') return <p>Contact Campus Security to change a report with an active recovery.</p>;
  return <section aria-label="Manage your report" style={{ display: 'grid', gap: '.8rem' }}>
    <h3>Manage my report</h3>
    {editing ? <form onSubmit={(e) => { e.preventDefault(); update(values); }} style={{ display: 'grid', gap: '.7rem' }}>
      {Object.entries(values).map(([key, value]) => <Input key={key}
        label={key.replace(/([A-Z])/g, ' $1')} value={value} required={key === 'itemName'}
        type={key.startsWith('date') ? 'date' : 'text'} maxLength={key === 'description' ? 5000 : key === 'color' ? 50 : 100}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })} />)}
      <Button type="submit" loading={saving}>Save Report</Button>
      <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
    </form> : <Button variant="outline" onClick={() => setEditing(true)}>Edit Report</Button>}
    <Button variant="outline" loading={saving} onClick={() => {
      if (window.confirm('Close this report and stop its matching suggestions? Contact security first if an item is in their custody.')) update({ action: 'close' });
    }}>{type === 'lost' ? 'Found it myself / Withdraw report' : 'Withdraw report'}</Button>
  </section>;
}
