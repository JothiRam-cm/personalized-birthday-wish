import { BirthdayConfig } from '../types/birthday';

export const DEFAULT_LETTER_BODY = `Happy Birthday Ammu💙🧚

Tnx for coming into my life and bringing so much happiness 😚

Naa unakaga edu varaikum edum pannathu illa... But enakaga nee avalo kasta paathuruka🥺...

Naa nenachada vida nee en mela avalo pasam vacha😇... Ena avalo happy ah vachikita💞.... Even un veetula perachana apa kuda ena vittu pogama inai varaikum en mela evalo care edutu ena evalo happy ah paathukura🤗

Inum neraya sollite polam... Because nee enaku avalo panniruka🥹

Yenna analum una vitura maten... Enaku needan nee matum dan🤌

Ipadiye en kuda kadasi varaikum iru dii... Ena vitu poiratha🥺

Unaku naa irukan yaarum illa feel pannatha seriya...unna nalla paathupen🫂🤌

Enaku kedaicha gem dii nee💎

Once again happy birthday dii chellowww 💙🫂😘`;

export const defaultBirthdayConfig: BirthdayConfig = {
  recipientName: 'Rubi(Ammu)',
  senderName: 'Your Special Someone',
  theme: {
    background: '#FFF7F8',
    secondaryBackground: '#FFF1F4',
    primary: '#EFA9B8',
    accent: '#C8758B',
    deepAccent: '#914B61',
  },
  greeting: 'Happy Birthday',
  balloonWords: ['YOU', 'ARE', 'MY', 'EVERYTHING'],
  bouquetMessages: [
    'You make my world beautiful.',
    'Happy Birthday, {name} 💙',
  ],
  letter: {
    heading: 'A Message From My Heart',
    greeting: 'Dear Princess {name} 👸💙,',
    body: DEFAULT_LETTER_BODY,
  },
  finalMessage: 'Lots of love for you 💙',
  keepsakePhotos: [
    {
      id: 'memory-1',
      title: 'Cherished Memory 1',
      dataUrl: '/assets/WhatsApp%20Image%202026-11-18%20at%2011.47.02%20PM.jpeg',
      caption: 'Our special moment',
    },
    {
      id: 'memory-2',
      title: 'Cherished Memory 2',
      dataUrl: '/assets/WhatsApp%20Image%202026-11-18%20at%2011.47.03%20PM.jpeg',
      caption: 'My favorite smile',
    },
    {
      id: 'memory-3',
      title: 'Cherished Memory 3',
      dataUrl: '/assets/WhatsApp%20Image%202026-11-18%20at%2011.47.03%20PM%20(1).jpeg',
      caption: 'Together forever',
    },
  ],
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
