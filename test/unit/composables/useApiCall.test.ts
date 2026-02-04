import { describe, it, expect, vi } from 'vitest'
import { useApiCall } from '@/composables/useApiCall'

describe('useApiCall', () => {
  it('initializes with correct default state', () => {
    const { data, error, isLoading } = useApiCall()
    expect(data.value).toBeNull()
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('sets isLoading to true during execution', async () => {
    const { isLoading, execute } = useApiCall()
    let loadingDuringExec = false

    const promise = execute(async () => {
      loadingDuringExec = isLoading.value
      return 'result'
    })

    await promise
    expect(loadingDuringExec).toBe(true)
  })

  it('sets data on successful execution', async () => {
    const { data, error, isLoading, execute } = useApiCall<string>()

    await execute(async () => 'hello')

    expect(data.value).toBe('hello')
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('sets error on failed execution', async () => {
    const { data, error, isLoading, execute } = useApiCall<string>()

    await execute(async () => {
      throw new Error('Network error')
    })

    expect(data.value).toBeNull()
    expect(error.value).toBe('Network error')
    expect(isLoading.value).toBe(false)
  })

  it('handles non-Error thrown values', async () => {
    const { error, execute } = useApiCall()

    await execute(async () => {
      throw 'string error'
    })

    expect(error.value).toBe('An error occurred')
  })

  it('clears previous error on new execution', async () => {
    const { error, execute } = useApiCall()

    await execute(async () => { throw new Error('first') })
    expect(error.value).toBe('first')

    await execute(async () => 'success')
    expect(error.value).toBeNull()
  })

  it('clears previous data on new execution failure', async () => {
    const { data, execute } = useApiCall<string>()

    await execute(async () => 'data')
    expect(data.value).toBe('data')

    await execute(async () => { throw new Error('fail') })
    expect(data.value).toBeNull()
  })

  it('resets isLoading after error', async () => {
    const { isLoading, execute } = useApiCall()

    await execute(async () => { throw new Error('fail') })
    expect(isLoading.value).toBe(false)
  })
})
