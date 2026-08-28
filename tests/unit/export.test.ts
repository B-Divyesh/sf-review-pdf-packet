import { describe, expect, it } from 'vitest';
import { buildPacketZip, escapeHtml, renderPacketHtml, validHttpUrl } from '../../src/export';
import { crc32 } from '../../src/zip';
import { validatePdfFile } from '../../src/pdf-validation';
import type { PacketState } from '../../src/types';

function file(parts: BlobPart[], name: string, type: string): File {
  return new File(parts, name, { type });
}

const state: PacketState = {
  title: 'Board <review>', preparedBy: 'A & B', handoffNote: 'Please check “scope”.',
  context: [{ id: '1', kind: 'comment', location: 'Page 2', text: '<script>alert(1)</script>' }],
  links: [{ id: '2', label: 'Source', url: 'https://example.com/brief?a=1&b=2' }],
  pdf: file(['%PDF-1.4'], 'report.pdf', 'application/pdf'), attachments: [file(['hello'], 'notes.txt', 'text/plain')],
};

describe('packet export safety', () => {
  it('escapes user-authored markup', () => {
    const html = renderPacketHtml(state, 'report.pdf', ['notes.txt']);
    expect(html).toContain('Board &lt;review&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('allows only web source links', () => {
    expect(validHttpUrl('https://example.com')).toBe('https://example.com/');
    expect(validHttpUrl('javascript:alert(1)')).toBeNull();
    expect(validHttpUrl('not a url')).toBeNull();
  });

  it('escapes all HTML control characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('builds a ZIP containing the index, PDF, stylesheet and attachments', async () => {
    const zip = new Uint8Array(await (await buildPacketZip(state)).arrayBuffer());
    const visible = new TextDecoder().decode(zip);
    expect([...zip.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(visible).toContain('index.html');
    expect(visible).toContain('print.css');
    expect(visible).toContain('report.pdf');
    expect(visible).toContain('attachments/notes.txt');
  });
});

describe('zip checksum', () => {
  it('matches the standard CRC32 vector', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
});

describe('PDF intake validation', () => {
  it('rejects empty, renamed text, and bad PDF payloads while allowing a valid empty-MIME PDF', async () => {
    await expect(validatePdfFile(file([], 'empty.pdf', 'application/pdf'))).resolves.toMatchObject({ valid: false, message: expect.stringContaining('empty') });
    await expect(validatePdfFile(file(['plain text'], 'spoofed.pdf', 'text/plain'))).resolves.toMatchObject({ valid: false, message: expect.stringContaining('not marked') });
    await expect(validatePdfFile(file(['not a PDF'], 'spoofed.pdf', 'application/pdf'))).resolves.toMatchObject({ valid: false, message: expect.stringContaining('header') });
    await expect(validatePdfFile(file(['%PDF-1.7\n'], 'portable.pdf', ''))).resolves.toEqual({ valid: true });
  });
});
