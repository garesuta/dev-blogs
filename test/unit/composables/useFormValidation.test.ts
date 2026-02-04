import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { useFormValidation } from '@/composables/useFormValidation'

const testSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
})

describe('useFormValidation', () => {
  it('initializes with no touched fields', () => {
    const { touched } = useFormValidation(testSchema)
    expect(touched.email).toBeFalsy()
    expect(touched.name).toBeFalsy()
  })

  it('returns null error for untouched field', () => {
    const { getFieldError } = useFormValidation(testSchema)
    expect(getFieldError('email', 'invalid')).toBeNull()
  })

  it('returns error message for touched invalid field', () => {
    const { getFieldError, touch } = useFormValidation(testSchema)
    touch('email')
    expect(getFieldError('email', 'invalid')).toBe('Invalid email')
  })

  it('returns null for touched valid field', () => {
    const { getFieldError, touch } = useFormValidation(testSchema)
    touch('email')
    expect(getFieldError('email', 'test@example.com')).toBeNull()
  })

  it('touches a single field', () => {
    const { touched, touch } = useFormValidation(testSchema)
    touch('email')
    expect(touched.email).toBe(true)
    expect(touched.name).toBeFalsy()
  })

  it('touches all fields', () => {
    const { touched, touchAll } = useFormValidation(testSchema)
    touchAll()
    expect(touched.email).toBe(true)
    expect(touched.name).toBe(true)
  })

  it('validates multiple fields independently', () => {
    const { getFieldError, touchAll } = useFormValidation(testSchema)
    touchAll()

    expect(getFieldError('email', 'bad')).toBe('Invalid email')
    expect(getFieldError('name', 'A')).toBe('Name too short')
    expect(getFieldError('email', 'good@test.com')).toBeNull()
    expect(getFieldError('name', 'Bob')).toBeNull()
  })

  it('handles schema with no shape for unknown field', () => {
    const { getFieldError, touch } = useFormValidation(testSchema)
    touch('unknown' as any)
    // Should not throw, returns null for unknown field
    expect(getFieldError('unknown' as any, 'value')).toBeNull()
  })
})
