import type { HealthResponse, VerifyResponse } from '../types/verification'

const RAW_BASE = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'https://verifai-backend-2tnw.onrender.com/api'
const API_BASE = RAW_BASE.replace(/\/+$/, '')

function buildUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  if (API_BASE.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${API_BASE}${cleanEndpoint.replace('/api', '')}`
  }
  return `${API_BASE}${cleanEndpoint}`
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const targetUrl = buildUrl('/health')
    const res = await fetch(targetUrl)
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // try fallback
  }

  // Fallback direct to Render
  try {
    const res = await fetch('https://verifai-backend-2tnw.onrender.com/api/health')
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // try relative
  }

  const fallback = await fetch('/api/health')
  if (!fallback.ok) throw new Error('Backend offline')
  return await fallback.json()
}

export async function submitVerification(file: File): Promise<VerifyResponse> {
  const form = new FormData()
  form.append('image', file)

  let res: Response | null = null

  // 1. Try configured API_BASE
  try {
    const targetUrl = buildUrl('/verify')
    const r = await fetch(targetUrl, {
      method: 'POST',
      body: form,
    })
    if (r.status !== 405 && r.status !== 404) {
      res = r
    }
  } catch {
    // network error, proceed to fallback
  }

  // 2. Try direct live Render endpoint if primary had 405/404 or network issue
  if (!res) {
    try {
      const r = await fetch('https://verifai-backend-2tnw.onrender.com/api/verify', {
        method: 'POST',
        body: form,
      })
      if (r.status !== 405) {
        res = r
      }
    } catch {
      // proceed to relative proxy
    }
  }

  // 3. Try relative endpoint via Vite proxy / Vercel proxy
  if (!res) {
    res = await fetch('/api/verify', {
      method: 'POST',
      body: form,
    })
  }

  const text = await res.text()
  if (!text) {
    throw new Error(`Server returned empty response (Status: ${res.status})`)
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Invalid server response (Status ${res.status}): ${text.slice(0, 120)}`)
  }

  if (!res.ok) {
    const errMsg = data?.detail || data?.error || data?.message || `Request failed with status ${res.status}`
    throw new Error(errMsg)
  }

  return data as VerifyResponse
}
