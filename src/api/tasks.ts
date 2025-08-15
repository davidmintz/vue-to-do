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

  return await res.json() as Promise<T>
}

function extractItems<T = unknown>(data: any): T[] {
  if (Array.isArray(data)) return data as T[]
  return (data?.member ?? data?.['hydra:member'] ?? []) as T[]
}

export async function listTasks(): Promise<Task[]> {
  const data = await request<any>('/tasks')
  return extractItems<Task>(data)
}

export type NewTask = { text: string; done?: boolean }

export async function createTask(input: NewTask): Promise<Task> {
  const payload = {
    text: input.text,
    done: input.done ?? false,
  }

  return request<Task>('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json', // request() already prefers JSON-LD in Accept
    },
    body: JSON.stringify(payload),
  })
}

export async function deleteTask(task: number | { id: number }): Promise<void> {
  const id = typeof task === 'number' ? task : task.id
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/ld+json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`DELETE /tasks/${id} failed: ${res.status} ${msg}`)
  }
  // API Platform typically returns 204 No Content on successful delete.
}

export async function patchTask(
  task: number | { id: number },
  changes: Partial<Pick<Task, 'text' | 'done'>>
): Promise<Task> {
  const id = typeof task === 'number' ? task : task.id

  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      'Accept': 'application/ld+json',
    },
    credentials: 'include',
    body: JSON.stringify(changes),
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`PATCH /tasks/${id} failed: ${res.status} ${msg}`)
  }

  // API Platform typically returns the updated resource (200 OK).
  return await res.json() as Promise<Task>
}

export async function getTask(id: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/ld+json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`GET /tasks/${id} failed: ${res.status} ${msg}`)
  }

  return await res.json() as Task
}

