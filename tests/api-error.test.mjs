import test from 'node:test'
import assert from 'node:assert/strict'
import { AxiosError } from 'axios'
import { ApiError, normalizeApiError } from '../src/services/api.ts'

test('normaliza mensagem e erros de campo retornados pela API', () => {
  const original = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    data: { status: false, message: 'Erro de validação', data: { cpf: 'CPF inválido' } },
  })
  const error = normalizeApiError(original)
  assert.ok(error instanceof ApiError)
  assert.equal(error.status, 400)
  assert.equal(error.message, 'Erro de validação')
  assert.deepEqual(error.fields, { cpf: 'CPF inválido' })
})

test('erro de rede não expõe detalhes internos', () => {
  const original = new AxiosError('getaddrinfo ENOTFOUND private-server')
  const error = normalizeApiError(original)
  assert.equal(error.status, null)
  assert.equal(error.message, 'Não foi possível conectar à API. Verifique sua conexão.')
})

test('trata conflito de versão 409 com mensagem amigável', () => {
  const original = new AxiosError('Request failed with status code 409', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 409,
    data: {},
  })
  const error = normalizeApiError(original)
  assert.equal(error.status, 409)
  assert.equal(error.message, 'Conflito de versão detectado. Os dados foram alterados em outra sessão.')
})
