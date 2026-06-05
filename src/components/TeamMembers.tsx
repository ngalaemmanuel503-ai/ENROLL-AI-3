import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Mail, UserPlus, ShieldAlert, CheckCircle, Clock, Trash2, Shield, RefreshCw } from 'lucide-react';

interface TeamMember {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'ADVISOR' | 'AGENT';
  status: 'ACTIVE' | 'INVITED' | 'REVOKED';
  invited_at: string;
  joined_at: string;
}

export default function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states to invite new members
  const [inviteMode, setInviteMode] = useState<'single' | 'multiple'>('single');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'ADVISOR' | 'AGENT'>('ADVISOR');
  const [inviteName, setInviteName] = useState('');
  const [multipleEmails, setMultipleEmails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchMembers() {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('enrollai_session_token');
    try {
      const res = await fetch('/api/team/members', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to fetch team members.');
      }
    } catch (e: any) {
      setError(e.message || 'Network error fetching team.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const targetEmailField = inviteMode === 'single' ? inviteEmail.trim() : multipleEmails.trim();
    if (!targetEmailField) return;

    setIsSubmitting(true);

    const token = localStorage.getItem('enrollai_session_token');
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          email: targetEmailField,
          role: inviteRole,
          name: inviteMode === 'single' ? inviteName : ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || 'Invitation successfully dispatched!');
        if (inviteMode === 'single') {
          setInviteEmail('');
          setInviteName('');
        } else {
          setMultipleEmails('');
        }
        setInviteRole('ADVISOR');
        await fetchMembers();
      } else {
        const err = await res.json();
        setError(err.error || err.message || 'Failed to trigger invite. Make sure you are the OWNER of this workspace.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateRole(id: string, newRole: string) {
    setError('');
    setSuccess('');
    const token = localStorage.getItem('enrollai_session_token');
    try {
      const res = await fetch('/api/team/members/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ id, role: newRole })
      });
      if (res.ok) {
        setSuccess('Role updated successfully.');
        await fetchMembers();
      } else {
        const err = await res.json();
        setError(err.error || 'Only OWNER accounts can re-assign organization roles.');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failed.');
    }
  }

  async function handleRevoke(id: string) {
    if (!window.confirm('Are you sure you want to revoke this user’s workspace access?')) return;
    setError('');
    setSuccess('');
    const token = localStorage.getItem('enrollai_session_token');
    try {
      const res = await fetch('/api/team/members/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setSuccess('Access successfully revoked.');
        await fetchMembers();
      } else {
        const err = await res.json();
        setError(err.error || 'Only OWNER accounts can terminate tenant access.');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failed.');
    }
  }

  return (
    <div id="team_management_container" className="space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Users className="w-6 h-6 text-indigo-500" />
            <span>Team Members</span>
          </h2>
          <p className="text-xs font-sans mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Manage administrative access rights, invite advisors, audit online roles, and revoke employee workspace accesses.
          </p>
        </div>
        <button 
          onClick={fetchMembers}
          className="p-2 border rounded-xl hover:bg-neutral-50 transition active:scale-95 text-xs text-neutral-600 flex items-center gap-1.5 cursor-pointer"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl text-xs bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 animate-fade-in mb-4">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-2 animate-fade-in mb-4">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid Layout: Left panel (Form to Invite), Right panel (List of team members) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INVITE FORM BLOCK */}
        <div className="lg:col-span-1 rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <UserPlus className="w-4.5 h-4.5 text-indigo-500" />
              <span>Invite Team Members</span>
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              Add a single employee or batch invite multiple advisors at once.
            </p>
          </div>

          {/* Sliding segment controller */}
          <div className="flex bg-neutral-100 dark:bg-zinc-800/60 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <button
              type="button"
              onClick={() => {
                setInviteMode('single');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                inviteMode === 'single' 
                  ? 'bg-white dark:bg-zinc-700 shadow text-neutral-800 dark:text-white' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
              style={{
                backgroundColor: inviteMode === 'single' ? 'var(--color-bg-card)' : 'transparent',
                color: inviteMode === 'single' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
            >
              Single Member
            </button>
            <button
              type="button"
              onClick={() => {
                setInviteMode('multiple');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                inviteMode === 'multiple' 
                  ? 'bg-white dark:bg-zinc-700 shadow text-neutral-800 dark:text-white' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
              style={{
                backgroundColor: inviteMode === 'multiple' ? 'var(--color-bg-card)' : 'transparent',
                color: inviteMode === 'multiple' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
            >
              Multiple Members
            </button>
          </div>

          <form onSubmit={handleInvite} className="space-y-3.5">
            {inviteMode === 'single' ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Employee Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Amina Bello"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="amina@enrollai.com"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email Addresses (Comma/Line Separated)</label>
                <textarea
                  required
                  rows={4}
                  value={multipleEmails}
                  onChange={(e) => setMultipleEmails(e.target.value)}
                  placeholder="amina@enrollai.com, benson@enrollai.com&#10;charles@enrollai.com"
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <span className="text-[9px] block mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Paste raw list of emails. Names will automatically derive based on their email prefixes.
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Assign Role Permissions</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="ADMIN">ADMIN - Full Settings & RAG Editing</option>
                <option value="ADVISOR">ADVISOR - Manage Chats & Leads</option>
                <option value="AGENT">AGENT - Chat Inbox Responder Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (inviteMode === 'single' ? (!inviteEmail || !inviteName) : !multipleEmails.trim())}
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold font-sans shadow transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {isSubmitting ? 'Sending Request...' : inviteMode === 'single' ? 'Dispatch Workspace Invite' : 'Dispatch Batch Workspace Invites'}
            </button>
          </form>
        </div>

        {/* TEAM MEMBERS LIST TABLE */}
        <div className="lg:col-span-2 rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              <span>Registered Accounts</span>
            </h3>
            <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
              {members.length} Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Member details</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Role Permissions</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                  <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                {members.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      No team members mapped yet. The primary account registers as OWNER automatically.
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50/50 transition-colors" style={{ contentVisibility: 'auto' }}>
                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600">
                          {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{m.name || 'Invited User'}</div>
                          <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                            <Mail className="w-3 h-3" />
                            <span>{m.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3.5 pr-2">
                      {m.role === 'OWNER' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                          <Shield className="w-3 h-3" />
                          <span>OWNER</span>
                        </span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                          className="border rounded-lg text-[10px] px-2 py-1 bg-transparent font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="ADVISOR">ADVISOR</option>
                          <option value="AGENT">AGENT</option>
                        </select>
                      )}
                    </td>

                    <td className="py-3.5 pr-2">
                      {m.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                      {m.status === 'INVITED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Invited</span>
                        </span>
                      )}
                      {m.status === 'REVOKED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Revoked</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      {m.role !== 'OWNER' && m.status !== 'REVOKED' && (
                        <button
                          onClick={() => handleRevoke(m.id)}
                          className="p-1 px-2 border hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ml-auto cursor-pointer"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
