// src/api/tasks.ts

// 1) Types
export interface Task {
  id: number
  text: string
  done: boolean
  createdAt?: string
  updatedAt?: string | null
}


// 2) Config
const API_BASE = (import.meta.env.VITE_API_BASE ?? '') || '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body != null

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      // Prefer JSON-LD; allow JSON as fallback so we’re future-proof
      Accept: 'application/ld+json, application/json;q=0.9, */*;q=0.1',
      // Only send Content-Type when there’s a body (POST/PATCH)
      ...(hasBody ? { 'Content-Type': 'application/ld+json' } : {}),
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    let detail = res.statusText
    try { detail = (await res.json())?.detail ?? detail } catch {}
    throw new Error(`HTTP ${res.status} - ${detail}`)
  }

  return res.json() as Promise<T>
}

function extractItems<T = unknown>(data: any): T[] {
  if (Array.isArray(data)) return data as T[]
  return (data?.member ?? data?.['hydra:member'] ?? []) as T[]
}

export async function listTasks(): Promise<Task[]> {
  const data = await request<any>('/tasks')
  return extractItems<Task>(data)
}
