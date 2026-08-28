/**
 * Perform the inexpensive checks a local-only file picker can make before a
 * document is presented as a usable PDF. File extensions and MIME metadata
 * are hints, not proof: inspecting the first kilobyte catches empty files and
 * renamed text payloads without loading a large document into memory.
 */
const PDF_HEADER_SCAN_BYTES = 1024;

export type PdfValidation = { valid: true } | { valid: false; message: string };

export async function validatePdfFile(file: File): Promise<PdfValidation> {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, message: 'That file is not a PDF. Choose a file ending in .pdf.' };
  }
  if (file.size === 0) {
    return { valid: false, message: 'That PDF is empty. Choose a PDF with document content.' };
  }
  if (file.type && file.type !== 'application/pdf') {
    return { valid: false, message: 'That file is not marked as a PDF. Choose the original PDF file.' };
  }

  const bytes = new Uint8Array(await file.slice(0, PDF_HEADER_SCAN_BYTES).arrayBuffer());
  const header = new TextDecoder('latin1').decode(bytes);
  if (!header.includes('%PDF-')) {
    return { valid: false, message: 'That file does not contain a readable PDF header. Choose the original PDF file.' };
  }
  return { valid: true };
}
