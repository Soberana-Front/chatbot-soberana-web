import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'
import { api } from '../src/services/api'
import React from 'react'

describe('Issue #25 (FE-012) - Logout e Encerramento da Sessão', () => {
  beforeEach(() => {
    localStorage.clear()
    delete api.defaults.headers.common['Authorization']
  })

  it('limpa o token e o usuário do localStorage e remove header de autorização ao deslogar', async () => {
    localStorage.setItem('@Soberana:token', 'sample-token')
    localStorage.setItem(
      '@Soberana:user',
      JSON.stringify({ id: 'user-1', name: 'Dr. Teste', email: 'teste@soberana.com' })
    )
    api.defaults.headers.common['Authorization'] = 'Bearer sample-token'

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('@Soberana:token')).toBeNull()
    expect(localStorage.getItem('@Soberana:user')).toBeNull()
    expect(api.defaults.headers.common['Authorization']).toBeUndefined()
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })
})
