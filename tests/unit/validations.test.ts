import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contactFormSchema } from '../../src/lib/validations'

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  projectType: 'branding',
  budgetRange: '5k-10k',
  message: 'I would love to discuss a packaging project with you.',
  website: '',
}

test('accepts a well-formed submission', () => {
  assert.equal(contactFormSchema.safeParse(valid).success, true)
})

test('rejects an invalid email', () => {
  const result = contactFormSchema.safeParse({ ...valid, email: 'not-an-email' })
  assert.equal(result.success, false)
})

test('rejects a too-short message', () => {
  const result = contactFormSchema.safeParse({ ...valid, message: 'hi' })
  assert.equal(result.success, false)
})

test('rejects a filled honeypot (bot)', () => {
  const result = contactFormSchema.safeParse({ ...valid, website: 'http://spam.example' })
  assert.equal(result.success, false)
})
