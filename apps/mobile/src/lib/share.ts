import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { STORY_HEIGHT, STORY_WIDTH } from '../components/StoryCard';

export type ShareOutcome = 'shared' | 'unavailable';

/**
 * Rasterises the on-screen card at the WhatsApp status size and opens the
 * native share sheet, where WhatsApp offers "My status".
 */
export async function shareCard(ref: React.RefObject<unknown>, title: string): Promise<ShareOutcome> {
  const uri = await captureRef(ref as never, {
    format: 'png',
    quality: 1,
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
  });
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
  return 'shared';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}
