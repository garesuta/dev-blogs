import { reactive } from 'vue'
import type { z } from 'zod'

export function useFormValidation<T extends z.ZodObject<any>>(schema: T) {
  const fields = Object.keys(schema.shape)
  const touched = reactive<Record<string, boolean>>(
    Object.fromEntries(fields.map((f) => [f, false]))
  )

  function getFieldError(field: string, value: unknown): string | null {
    if (!touched[field]) return null
    const fieldSchema = schema.shape[field]
    if (!fieldSchema) return null
    const result = fieldSchema.safeParse(value)
    return result.success ? null : result.error.issues[0]?.message ?? null
  }

  function touch(field: string) {
    touched[field] = true
  }

  function touchAll() {
    for (const field of fields) {
      touched[field] = true
    }
  }

  return { touched, getFieldError, touch, touchAll }
}
