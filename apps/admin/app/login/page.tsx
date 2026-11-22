'use client';

import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, KeyRound, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { BRAND_NAME } from '@stoncrops/shared';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [requireMfa, setRequireMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await login(email.trim(), password, requireMfa ? mfaCode.trim() : undefined);
    setLoading(false);

    if (!res.success) {
      if (res.requireMfa) {
        setRequireMfa(true);
      } else {
        setErrorMessage(res.error || 'Invalid administrator email or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-burgundy-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="wordmark text-2xl sm:text-3xl font-extrabold tracking-[0.3em] text-white block">
            {BRAND_NAME}
          </span>
          <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-zinc-400">
            Internal Management Console
          </h2>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-burgundy-400 bg-burgundy-950/70 border border-burgundy-900/80 px-3 py-1 rounded-full">
            <Lock className="w-3 h-3 text-burgundy-400" />
            <span>Restricted Access • Authorized Personnel Only</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#121215] border border-zinc-800/80 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 backdrop-blur-md">
          {errorMessage && (
            <div className="bg-red-950/70 border border-red-800 p-3 rounded text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!requireMfa ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@stoncrops.com"
                      className="w-full bg-[#0A0A0C] border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600 text-xs transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-[#0A0A0C] border border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-600 text-xs transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Two-Factor Authentication (MFA Code)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full bg-[#0A0A0C] border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-zinc-100 font-mono tracking-widest text-center focus:outline-none focus:border-burgundy-600 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-obsidian-950 font-bold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-[10px] text-zinc-600">
              STONCROPS Security Architecture • All sessions are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
