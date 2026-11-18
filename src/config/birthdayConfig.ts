import { BirthdayConfig } from '../types/birthday';

export const DEFAULT_LETTER_BODY = `Happy Birthday!

I hope this special day brings you endless happiness, beautiful memories and countless reasons to smile.

You deserve all the love, kindness and wonderful things life has to offer.

May every dream you hold close slowly become a beautiful reality.

Never forget how special you are and how much happiness you bring into the lives of the people around you.

Keep smiling, keep shining and never stop being yourself.

Wishing you a year filled with laughter, adventures, beautiful surprises and unforgettable moments.

With lots of love ❤️`;

export const defaultBirthdayConfig: BirthdayConfig = {
  recipientName: 'Samyuuu',
  senderName: 'Your Special Someone',
  theme: {
    background: '#FFF7F8',
    secondaryBackground: '#FFF1F4',
    primary: '#EFA9B8',
    accent: '#C8758B',
    deepAccent: '#914B61',
  },
  greeting: 'Happy Birthday',
  balloonWords: ['YOU', 'ARE', 'SO', 'SPECIAL'],
  bouquetMessages: [
    'You make my world beautiful.',
    'Happy Birthday, {name} ❤️',
  ],
  letter: {
    heading: 'A Message From My Heart',
    greeting: 'Dear {name} 🎀 💗,',
    body: DEFAULT_LETTER_BODY,
  },
  finalMessage: 'Lots of love for you ❤️',
  keepsakePhotos: [],
  enableMicrophone: true,
  enableMusic: false,
  enableSharing: true,
};

export function formatPersonalizedText(
  template: string,
  recipientName: string,
  senderName?: string
): string {
  const cleanRecipient = recipientName.trim() || 'Sweetheart';
  const cleanSender = senderName?.trim() || 'Someone Special';
  return template
    .replaceAll('{name}', cleanRecipient)
    .replaceAll('[RECIPIENT_NAME]', cleanRecipient)
    .replaceAll('{sender}', cleanSender);
}

export const THEME_PRESETS: Array<{
  label: string;
  theme: BirthdayConfig['theme'];
}> = [
  {
    label: 'Blush Rose',
    theme: {
      background: '#FFF7F8',
      secondaryBackground: '#FFF1F4',
      primary: '#EFA9B8',
      accent: '#C8758B',
      deepAccent: '#914B61',
    },
  },
  {
    label: 'Lavender Dream',
    theme: {
      background: '#FAF7FF',
      secondaryBackground: '#F4EEFF',
      primary: '#C9B6E4',
      accent: '#9B7EC8',
      deepAccent: '#6A4E99',
    },
  },
  {
    label: 'Peach Blossom',
    theme: {
      background: '#FFF8F4',
      secondaryBackground: '#FFF0E8',
      primary: '#F3B6A2',
      accent: '#D47F6A',
      deepAccent: '#9B4D3D',
    },
  },
  {
    label: 'Mint Sorbet',
    theme: {
      background: '#F6FBF8',
      secondaryBackground: '#EBF6F0',
      primary: '#9FD3BA',
      accent: '#63A88A',
      deepAccent: '#3D785E',
    },
  },
];
