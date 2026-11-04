import test from 'node:test'
import assert from 'node:assert/strict'
import { formatFieldValue, parseFieldValue } from '../src/utils/formattedFields.ts'

test('moeda preserva o valor numérico usado pela API', () => {
  assert.equal(parseFieldValue('currency', 'R$ 1.234,56'), 1234.56)
  assert.equal(parseFieldValue('currency', '1234,56'), 1234.56)
  assert.equal(formatFieldValue('currency', 1234.56), 'R$ 1.234,56')
})

test('percentual suporta as duas escalas do OpenAPI', () => {
  assert.equal(parseFieldValue('percent', '12,5', 100), 0.125)
  assert.equal(parseFieldValue('percent', '12,5', 1), 12.5)
  assert.equal(formatFieldValue('percent', 0.125, 100), '12,5%')
  assert.equal(formatFieldValue('percent', 12.5, 1), '12,5%')
})

test('CPF, telefone e duração retornam valores sem máscara', () => {
  assert.equal(parseFieldValue('cpf', '123.456.789-01'), '12345678901')
  assert.equal(parseFieldValue('phone', '(11) 98765-4321'), '11987654321')
  assert.equal(parseFieldValue('duration', '45 min'), 45)
  assert.equal(formatFieldValue('cpf', '12345678901'), '123.456.789-01')
  assert.equal(formatFieldValue('phone', '11987654321'), '(11) 98765-4321')
})

test('campos vazios não são enviados como zero', () => {
  for (const kind of ['currency', 'percent', 'cpf', 'phone', 'duration']) {
    assert.equal(parseFieldValue(kind, ''), null)
  }
})
