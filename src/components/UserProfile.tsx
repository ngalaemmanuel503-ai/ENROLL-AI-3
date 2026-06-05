import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Upload, Camera, 
  Linkedin, Youtube, Facebook, Save, 
  CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';

interface UserProfileProps {
  onProfileUpdated?: () => void;
}

export default function UserProfile({ onProfileUpdated }: UserProfileProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');

  // UI Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('enrollai_session_token');

    try {
      const res = await fetch('/api/tenant/me', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setProfileImageUrl(data.profile_image_url || '');
        setLinkedinUrl(data.linkedin_url || '');
        setYoutubeUrl(data.youtube_url || '');
        setFacebookUrl(data.facebook_url || '');
      } else {
        setErrorMsg('Failed to download active profile settings.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred connecting to the backend.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    const token = localStorage.getItem('enrollai_session_token');

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name,
          phone,
          linkedin_url: linkedinUrl,
          youtube_url: youtubeUrl,
          facebook_url: facebookUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message || 'Profile saved successfully!');
        if (onProfileUpdated) {
          onProfileUpdated();
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Failed to apply profile changes.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to server.');
    } finally {
      setSaving(false);
    }
  }

  const handleImageFile = async (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Check size limit (500 KB)
    const MAX_SIZE = 500 * 1024; // 500KB
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File size exceeds 500KB limit (${(file.size / 1024).toFixed(1)}KB found). Please select a compressed file.`);
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('enrollai_session_token');

    try {
      // Read file into Base64 format
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const res = await fetch('/api/profile/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            base64Data,
            fileName: file.name,
            mimeType: file.type
          })
        });

        if (res.ok) {
          const data = await res.json();
          setProfileImageUrl(data.imageUrl);
          setSuccessMsg('Profile picture uploaded successfully!');
          if (onProfileUpdated) {
            onProfileUpdated();
          }
        } else {
          const err = await res.json();
          setErrorMsg(err.message || 'Failed uploading avatar image.');
        }
        setUploading(false);
      };
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed resolving file properties.');
      setUploading(false);
    }
  };

  const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs font-semibold text-neutral-400 font-mono tracking-widest">LOADING SETTINGS PROFILE...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" id="user-profile-section">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm transition-all" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            <h1 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>My Profile</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Configure your workspace avatar, name, social networks, and authorization phone number.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border bg-neutral-50 dark:bg-zinc-800" style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
          <span>ID: {email.split('@')[0]}</span>
        </div>
      </div>

      {successMsg && (
        <div id="success-alert-node" className="flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div id="error-alert-node" className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Identity Card (Left) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl border bg-white dark:bg-zinc-900 text-center space-y-5" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            
            {/* Avatar block */}
            <div className="relative w-28 h-28 mx-auto" id="profile-avatar-container">
              <div className="w-full h-full rounded-full border-4 border-indigo-50 dark:border-zinc-800 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 shadow-inner">
                {profileImageUrl ? (
                  <img 
                    src={profileImageUrl} 
                    alt="active profile visual" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-3xl font-black text-indigo-500 uppercase">{name ? name.charAt(0) : 'E'}</span>
                )}
              </div>

              {/* Overlapping small file uploader button */}
              <label htmlFor="file-image-input" className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-full cursor-pointer shadow-lg hover:scale-105 active:scale-95 duration-100 flex items-center justify-center">
                <Camera className="w-4 h-4" />
                <input 
                  type="file"
                  id="file-image-input"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {/* Profile Info block */}
            <div className="space-y-1">
              <h2 className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{name || 'Workspace Owner'}</h2>
              <p className="text-[10px] font-mono" style={{ color: 'var(--color-text-secondary)' }}>{email}</p>
            </div>

            {/* Drag and Drop File box */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onFileDrop}
              className="border-2 border-dashed rounded-xl p-4 transition-all hover:bg-neutral-50 dark:hover:bg-zinc-800/40 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Upload className={`w-5 h-5 ${uploading ? 'animate-bounce text-indigo-500' : 'text-neutral-400'}`} />
              <span className="text-[10px] font-bold block" style={{ color: 'var(--color-text-primary)' }}>
                {uploading ? 'Processing Image...' : 'Drag new avatar here'}
              </span>
              <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>
                Max size: <strong className="font-extrabold text-neutral-600 dark:text-neutral-300">500 KB</strong> (PNG, JPG)
              </p>
            </div>

            {/* Small guide note */}
            <p className="text-[9px] block bg-indigo-50/50 dark:bg-zinc-800/40 rounded-lg p-2.5 leading-relaxed text-left" style={{ color: 'var(--color-text-secondary)' }}>
              🔑 <strong className="text-indigo-600 dark:text-indigo-400">Supabase Integration</strong>: Uploaded files are automatically directed and stored in real-time within live Supabase buckets whenever standard API credentials are configured.
            </p>
          </div>
        </div>

        {/* Profile Settings Fields Form (Right) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl border bg-white dark:bg-zinc-900 space-y-5" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-2.5 mb-1" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>
              Editable Profile Meta Values
            </h2>

            {/* Core credentials grouping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Emmanuel Ngala"
                    className="w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +237 670 11 22 33"
                    className="w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Disabled Workspace ID */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5 text-neutral-400">Registered Email (Read-Only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="email" 
                  disabled
                  value={email}
                  className="w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs opacity-65 cursor-not-allowed bg-neutral-100 dark:bg-zinc-800"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                />
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-2.5 pt-2" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>
              Social Media Connections
            </h2>

            {/* Social channels inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LinkedIn Profile Link</span>
                </label>
                <input 
                  type="url" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  <span>YouTube Channel Link</span>
                </label>
                <input 
                  type="url" 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/c/yourchannel"
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <Facebook className="w-3.5 h-3.5 text-blue-700" />
                  <span>Facebook Profile Link</span>
                </label>
                <input 
                  type="url" 
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-white text-xs font-bold font-sans shadow transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
