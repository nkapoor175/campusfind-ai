import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage({ onNavigate }) {
  const { user, role, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => ({ name: user?.Name || '', phone: user?.Phone || '', department: user?.Department || '', year: user?.Year || '', hostel: user?.Hostel || '' }));
  const [saving, setSaving] = useState(false);
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      updateUser(await api.updateProfile(form));
      toast.success('Profile saved');
    } catch (err) { toast.error(err.message || 'Failed to save profile'); }
    finally { setSaving(false); }
  };
  if (role !== 'student') return <div className="app-container"><p>Profile editing is available for student accounts.</p></div>;
  return <div className="app-container" style={{ maxWidth: 640, padding: '2rem' }}>
    <h1>My Profile &amp; Reports</h1><p>{user?.Email}</p>
    <form onSubmit={save} style={{ display: 'grid', gap: '1rem', margin: '1rem 0' }}>
      {Object.entries(form).map(([key, value]) => <Input key={key}
        label={key.charAt(0).toUpperCase() + key.slice(1)} value={value}
        required={key === 'name'} type={key === 'year' ? 'number' : 'text'}
        min={key === 'year' ? 1 : undefined} max={key === 'year' ? 10 : undefined}
        maxLength={key === 'phone' ? 20 : 100}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
      <Button type="submit" loading={saving}>Save Profile</Button>
    </form>
    <Button variant="outline" onClick={() => onNavigate('dashboard')}>My Reports &amp; Claims</Button>
  </div>;
}
