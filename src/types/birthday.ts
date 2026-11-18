export type StageId =
  | 'welcome'
  | 'balloons'
  | 'candle'
  | 'bouquet'
  | 'letter'
  | 'gift'
  | 'final';

export interface KeepsakePhoto {
  id: string;
  title: string;
  dataUrl: string;
  driveFileId?: string;
  caption?: string;
}

export interface BirthdayTheme {
  background: string;
  secondaryBackground: string;
  primary: string;
  accent: string;
  deepAccent: string;
}

export interface BirthdayLetterConfig {
  heading: string;
  greeting: string;
  body: string;
}

export interface BirthdayConfig {
  id?: string;
  recipientName: string;
  senderName: string;
  theme: BirthdayTheme;
  greeting: string;
  balloonWords: [string, string, string, string];
  bouquetMessages: [string, string];
  letter: BirthdayLetterConfig;
  finalMessage: string;
  keepsakePhotos: KeepsakePhoto[];
  enableMicrophone: boolean;
  enableMusic: boolean;
  enableSharing: boolean;
}

export interface BirthdayFlowState {
  currentStage: StageId;
  poppedBalloons: [boolean, boolean, boolean, boolean];
  candleExtinguished: boolean;
  wishMade: boolean;
  envelopeOpened: boolean;
  letterCompleted: boolean;
  giftOpened: boolean;
}

export interface DriveWishSummary {
  fileId: string;
  name: string;
  modifiedTime: string;
  recipientName?: string;
}

export interface DrivePhotoItem {
  fileId: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  modifiedTime?: string;
}
