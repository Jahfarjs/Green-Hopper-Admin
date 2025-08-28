import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo-white.png'
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')

      localStorage.setItem('admin_token', data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0b0b0b] to-[#111111] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:block">
          <div className="bg-[#0f1310] rounded-2xl border border-[#5B8424]/20 p-10 h-full flex flex-col justify-between">
            <div>
              <img src={logo} alt="GreenHopper" className="h-14 mb-6" />
              <h2 className="text-white text-3xl font-bold">Welcome back, Admin</h2>
              <p className="text-white/60 mt-3">Manage bookings, track status, and take quick actions from your dashboard.</p>
            </div>
            <div className="mt-10">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#111111] border border-white/5 p-4 text-center">
                  <div className="text-white text-2xl font-bold">24/7</div>
                  <div className="text-white/60 text-xs mt-1">Secure</div>
                </div>
                <div className="rounded-xl bg-[#111111] border border-white/5 p-4 text-center">
                  <div className="text-white text-2xl font-bold">Fast</div>
                  <div className="text-white/60 text-xs mt-1">Access</div>
                </div>
                <div className="rounded-xl bg-[#111111] border border-white/5 p-4 text-center">
                  <div className="text-white text-2xl font-bold">Smart</div>
                  <div className="text-white/60 text-xs mt-1">Actions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="w-full bg-[#0f1310] p-8 rounded-2xl border border-[#5B8424]/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 md:hidden">
              <img src={logo} alt="GreenHopper" className="h-10" />
              <span className="text-white font-semibold">Admin</span>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-6">Sign in to your account</h1>
            {error && (
              <div className="mb-4 text-sm text-red-300 bg-red-900/30 border border-red-700 rounded px-3 py-2">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white mb-1">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0c0c0c] border border-white/5 rounded-lg focus:outline-none focus:border-[#5B8424] text-white placeholder-white/40"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Password</label>
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0c0c0c] border border-white/5 rounded-lg focus:outline-none focus:border-[#5B8424] text-white placeholder-white/40"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5B8424] text-white py-2 rounded-lg font-semibold hover:bg-[#6aa329] transition-colors disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


