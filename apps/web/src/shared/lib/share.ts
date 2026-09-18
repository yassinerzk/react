export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

interface ShareOptions {
  fileName: string;
  title?: string;
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') return false;
  try {
    const probe = new File([new Uint8Array(1)], 'probe.png', { type: 'image/png' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/**
 * Shares a PNG through the native share sheet (where WhatsApp's "My status"
 * appears on phones) and falls back to a download on desktop browsers.
 */
export async function sharePng(blob: Blob, { fileName, title }: ShareOptions): Promise<ShareOutcome> {
  const file = new File([blob], fileName, { type: 'image/png' });
  if (canShareFiles()) {
    try {
      // No `text` is attached: some share targets (WhatsApp included) drop
      // the image when text is sent alongside a file.
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // Fall through to download on any other failure.
    }
  }
  download(blob, fileName);
  return 'downloaded';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** WhatsApp deep link with prefilled text (for sharing the caption). */
export function whatsappTextUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
