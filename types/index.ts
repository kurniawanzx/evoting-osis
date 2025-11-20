export interface User {
  _id?: string
  nis: string
  name: string
  username: string
  email: string
  password: string
  class: string
  role: 'admin' | 'voter'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Candidate {
  _id?: string
  name: string
  class: string
  vision: string
  mission: string[]
  number: number
  photo?: string
  votes: number
  createdAt: Date
}

export interface Vote {
  _id?: string
  userId: string
  candidateId: string
  votedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface Setting {
  _id?: string
  key: string
  value: any
  createdAt?: Date
  updatedAt?: Date
}

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: string[]
}
