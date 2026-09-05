import type { HealthResponse, VerifyResponse } from '../types/verification'

const API_BASE = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'https://verifai-backend-2tnw.onrender.com/api'

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) {
      // Try relative fallback
      const fallback = await fetch('/api/health')
      if (!fallback.ok) throw new Error('Health check failed')
      return await fallback.json()
    }
    return await res.json()
  } catch {
    // Relative fallback
    const fallback = await fetch('/api/health')
    if (!fallback.ok) throw new Error('Backend offline')
    return await fallback.json()
  }
}

export async function submitVerification(file: File): Promise<VerifyResponse> {
  const form = new FormData()
  form.append('image', file)

  let res: Response
  try {
    res = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      body: form,
    })
  } catch {
    // Try relative endpoint via Vite proxy
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
