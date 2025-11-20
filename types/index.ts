
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
