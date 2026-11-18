import { defaultBirthdayConfig } from '../config/birthdayConfig';
import { BirthdayConfig } from '../types/birthday';

type SharePayload = Omit<
  BirthdayConfig,
  'keepsakePhotos' | 'id'
>;

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function buildShareUrl(config: BirthdayConfig): string {
  const payload: SharePayload = {
    recipientName: config.recipientName,
    senderName: config.senderName,
    theme: config.theme,
    greeting: config.greeting,
    balloonWords: config.balloonWords,
    bouquetMessages: config.bouquetMessages,
    letter: config.letter,
    finalMessage: config.finalMessage,
    enableMicrophone: config.enableMicrophone,
    enableMusic: config.enableMusic,
    enableSharing: config.enableSharing,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}#wish=${encoded}`;
}

export function parseConfigFromUrl(): BirthdayConfig | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('wish=')) return null;
    const raw = hash.split('wish=')[1]?.split('&')[0];
    if (!raw) return null;
    const parsed = JSON.parse(fromBase64Url(raw)) as Partial<SharePayload>;
    return {
      ...defaultBirthdayConfig,
      ...parsed,
      theme: {
        ...defaultBirthdayConfig.theme,
        ...(parsed.theme || {}),
      },
      letter: {
        ...defaultBirthdayConfig.letter,
        ...(parsed.letter || {}),
      },
      balloonWords:
        Array.isArray(parsed.balloonWords) && parsed.balloonWords.length === 4
          ? (parsed.balloonWords as [string, string, string, string])
          : defaultBirthdayConfig.balloonWords,
      bouquetMessages:
        Array.isArray(parsed.bouquetMessages) &&
        parsed.bouquetMessages.length === 2
          ? (parsed.bouquetMessages as [string, string])
          : defaultBirthdayConfig.bouquetMessages,
      keepsakePhotos: [],
    };
  } catch {
    return null;
  }
}
