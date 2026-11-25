import { StudyDocumentPayload } from '../types';

export const MAX_STUDY_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per file
export const MAX_STUDY_FILES = 3;

const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md', '.csv', '.png', '.jpg', '.jpeg', '.webp'];

function inferMimeType(file: File): string {
  if (file.type) {
    if (file.type === 'text/markdown') return 'text/plain';
    return file.type;
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv')) return 'text/plain';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function readStudyFile(file: File): Promise<StudyDocumentPayload> {
  const lower = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext));
  if (!hasAllowedExt) {
    throw new Error(`Unsupported file "${file.name}". Upload PDF, TXT, MD, PNG, or JPG files.`);
  }
  if (file.size > MAX_STUDY_FILE_BYTES) {
    throw new Error(`"${file.name}" exceeds the 8 MB size limit.`);
  }

  const mimeType = inferMimeType(file);
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      if (commaIdx === -1) {
        reject(new Error(`Could not read "${file.name}".`));
        return;
      }
      resolve(result.slice(commaIdx + 1));
    };
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.readAsDataURL(file);
  });

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    mimeType,
    sizeBytes: file.size,
    base64Data
  };
}
