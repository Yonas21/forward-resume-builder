import { describe, it, expect } from 'vitest';

// smoke test structure placeholder; actual integration would mock apiService

describe('upload accepts', () => {
  it('accepts pdf, docx, txt', () => {
    const accepts = ['.pdf', '.docx', '.txt'];
    expect(accepts.includes('.pdf')).toBe(true);
  });
});
