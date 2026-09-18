import { toBlob } from 'html-to-image';

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

const isSafari = () =>
  typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/**
 * Rasterises a story card DOM node to a PNG blob at the WhatsApp status
 * size (1080x1920). The node must be laid out at that size; a CSS transform
 * on an ancestor (used for the on-screen preview) does not affect the output.
 */
export async function renderStoryToPng(node: HTMLElement): Promise<Blob> {
  const options = {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    pixelRatio: 1,
    cacheBust: false,
    style: { transform: 'none', margin: '0' },
  };
  await Promise.all(
    Array.from(node.querySelectorAll('img')).map((img) =>
      img.complete ? Promise.resolve() : img.decode().catch(() => undefined),
    ),
  );
  // WebKit sometimes drops web fonts on the first render of a fresh page.
  // A throwaway pass warms its cache so the real pass is correct.
  if (isSafari()) await toBlob(node, options).catch(() => null);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error('Could not render the image');
  return blob;
}
