import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  Cloud,
  FolderOpen,
  ImagePlus,
  Loader2,
  LogOut,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  BirthdayConfig,
  DrivePhotoItem,
  DriveWishSummary,
  KeepsakePhoto,
} from '../types/birthday';
import {
  defaultBirthdayConfig,
  THEME_PRESETS,
} from '../config/birthdayConfig';
import {
  getAccessToken,
  googleSignIn,
  initAuth,
  logoutGoogle,
} from '../services/googleAuth';
import {
  compressImageBlobToDataUrl,
  deleteWishFromDrive,
  downloadDriveImageAsDataUrl,
  listDriveImages,
  listSavedWishes,
  loadWishFromDrive,
  saveWishToDrive,
  uploadPhotoToDrive,
} from '../services/googleDrive';
import { PrimaryButton } from './PrimaryButton';

interface CustomizeDrawerProps {
  open: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  onChangeConfig: (next: BirthdayConfig) => void;
  onJumpToStage?: (stage: 'welcome' | 'final') => void;
}

type DrawerTab = 'personalize' | 'photos' | 'drive';

interface PendingConfirm {
  title: string;
  description: string;
  confirmLabel: string;
  tone: 'danger' | 'primary';
  onConfirm: () => Promise<void>;
}

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  open,
  onClose,
  config,
  onChangeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('personalize');
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [savedWishes, setSavedWishes] = useState<DriveWishSummary[]>([]);
  const [driveImages, setDriveImages] = useState<DrivePhotoItem[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveStatusMsg, setDriveStatusMsg] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null
  );
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const unsub = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  const refreshDriveData = async (tokenOverride?: string) => {
    const token = tokenOverride || (await getAccessToken());
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setDriveLoading(true);
    setDriveError(null);
    try {
      const [wishes, imgs] = await Promise.all([
        listSavedWishes(token),
        listDriveImages(token),
      ]);
      setSavedWishes(wishes);
      setDriveImages(imgs);
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Unable to reach Google Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  useEffect(() => {
    if (open && !needsAuth && (activeTab === 'drive' || activeTab === 'photos')) {
      void refreshDriveData();
    }
  }, [open, needsAuth, activeTab]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setDriveError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        setDriveStatusMsg(`Connected as ${result.user.email || 'Google user'}`);
        await refreshDriveData(result.accessToken);
      }
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Google sign-in could not complete.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setNeedsAuth(true);
    setSavedWishes([]);
    setDriveImages([]);
    setDriveStatusMsg(null);
  };

  const handleSaveNewToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setDriveLoading(true);
    setDriveError(null);
    try {
      const summary = await saveWishToDrive(token, config);
      onChangeConfig({ ...config, id: summary.fileId });
      setDriveStatusMsg(`Saved "${summary.name}" to your Birthday Wishes folder.`);
      await refreshDriveData(token);
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Failed to save wish to Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  const requestOverwriteWish = () => {
    if (!config.id) return;
    setPendingConfirm({
      title: 'Overwrite Saved Wish in Google Drive?',
      description: `This will replace the contents of "Birthday Wish for ${config.recipientName}" (${config.id}) in your Google Drive with your current edits and keepsake photos.`,
      confirmLabel: 'Overwrite Wish',
      tone: 'primary',
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) {
          setNeedsAuth(true);
          return;
        }
        const summary = await saveWishToDrive(token, config, config.id);
        setDriveStatusMsg(`Updated "${summary.name}" in Google Drive.`);
        await refreshDriveData(token);
      },
    });
  };

  const handleLoadWish = async (wish: DriveWishSummary) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setDriveLoading(true);
    setDriveError(null);
    try {
      const loaded = await loadWishFromDrive(token, wish.fileId);
      onChangeConfig({
        ...defaultBirthdayConfig,
        ...loaded,
        id: wish.fileId,
      });
      setDriveStatusMsg(`Loaded "${wish.name}" from Google Drive.`);
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Could not load wish from Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  const requestDeleteWish = (wish: DriveWishSummary) => {
    setPendingConfirm({
      title: 'Delete Saved Wish from Google Drive?',
      description: `Are you sure you want to delete "${wish.name}" from your Google Drive? This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      tone: 'danger',
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) {
          setNeedsAuth(true);
          return;
        }
        await deleteWishFromDrive(token, wish.fileId);
        if (config.id === wish.fileId) {
          onChangeConfig({ ...config, id: undefined });
        }
        setDriveStatusMsg(`Deleted "${wish.name}" from Google Drive.`);
        await refreshDriveData(token);
      },
    });
  };

  const handleLocalPhotoAdd = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const added: KeepsakePhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await compressImageBlobToDataUrl(file);
      added.push({
        id: `${Date.now()}-${i}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        dataUrl,
        caption: '',
      });
    }

    if (added.length > 0) {
      onChangeConfig({
        ...config,
        keepsakePhotos: [...config.keepsakePhotos, ...added],
      });
    }
    e.target.value = '';
  };

  const handleImportDrivePhoto = async (item: DrivePhotoItem) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setDriveLoading(true);
    setDriveError(null);
    try {
      const dataUrl = await downloadDriveImageAsDataUrl(token, item.fileId);
      const photo: KeepsakePhoto = {
        id: `drive-${item.fileId}-${Date.now()}`,
        title: item.name.replace(/\.[^.]+$/, ''),
        dataUrl,
        driveFileId: item.fileId,
        caption: item.name.replace(/\.[^.]+$/, ''),
      };
      onChangeConfig({
        ...config,
        keepsakePhotos: [...config.keepsakePhotos, photo],
      });
      setDriveStatusMsg(`Added "${item.name}" to Keepsake Memories.`);
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Failed to import photo from Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  const handleUploadPhotoToDrive = async (photo: KeepsakePhoto) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setDriveLoading(true);
    setDriveError(null);
    try {
      const fileId = await uploadPhotoToDrive(
        token,
        photo.caption || photo.title,
        photo.dataUrl
      );
      onChangeConfig({
        ...config,
        keepsakePhotos: config.keepsakePhotos.map((p) =>
          p.id === photo.id ? { ...p, driveFileId: fileId } : p
        ),
      });
      setDriveStatusMsg(`Backed up "${photo.title}" to Birthday Wishes folder.`);
      await refreshDriveData(token);
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Could not upload photo to Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  const runConfirmedAction = async () => {
    if (!pendingConfirm) return;
    setConfirmBusy(true);
    setDriveError(null);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } catch (err) {
      setDriveError(
        err instanceof Error ? err.message : 'Operation failed.'
      );
      setPendingConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#3B212A]/35"
      role="dialog"
      aria-modal="true"
      aria-label="Personalize Birthday Wish and Google Drive"
    >
      <div className="w-full max-w-md bg-[#FFFDF9] h-full shadow-2xl border-l border-[#EED8DE] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EED8DE] bg-[#FFF7F8] flex items-center justify-between">
          <div>
            <h2 className="font-serif-editorial font-semibold text-xl text-[#914B61]">
              Personalize &amp; Drive
            </h2>
            <p className="text-xs text-[#A27B84]">
              Edit messages, keepsakes, or sync with Google Drive
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customize drawer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#684650] hover:bg-[#FFF1F4] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="px-5 pt-3 pb-2 bg-[#FFF7F8] border-b border-[#EED8DE] flex gap-1.5">
          {(
            [
              { id: 'personalize', label: 'Details', icon: Sparkles },
              { id: 'photos', label: 'Photos', icon: ImagePlus },
              { id: 'drive', label: 'Google Drive', icon: Cloud },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#914B61] border border-[#EED8DE] shadow-sm'
                    : 'text-[#A27B84] hover:text-[#684650]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm">
          {activeTab === 'personalize' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#914B61]">
                    Recipient Name
                  </span>
                  <input
                    type="text"
                    value={config.recipientName}
                    onChange={(e) =>
                      onChangeConfig({ ...config, recipientName: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl border border-[#EED8DE] bg-white text-[#684650] focus:outline-none focus:border-[#C8758B]"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#914B61]">
                    Sender Name
                  </span>
                  <input
                    type="text"
                    value={config.senderName}
                    onChange={(e) =>
                      onChangeConfig({ ...config, senderName: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl border border-[#EED8DE] bg-white text-[#684650] focus:outline-none focus:border-[#C8758B]"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#914B61]">
                  Welcome Greeting
                </span>
                <input
                  type="text"
                  value={config.greeting}
                  onChange={(e) =>
                    onChangeConfig({ ...config, greeting: e.target.value })
                  }
                  className="px-3 py-2 rounded-xl border border-[#EED8DE] bg-white text-[#684650] focus:outline-none focus:border-[#C8758B]"
                />
              </label>

              <div>
                <span className="text-xs font-bold text-[#914B61] block mb-1.5">
                  4 Balloon Reveal Words
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {config.balloonWords.map((word, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={word}
                      onChange={(e) => {
                        const next = [...config.balloonWords] as [
                          string,
                          string,
                          string,
                          string,
                        ];
                        next[idx] = e.target.value;
                        onChangeConfig({ ...config, balloonWords: next });
                      }}
                      aria-label={`Balloon word ${idx + 1}`}
                      className="px-3 py-1.5 rounded-xl border border-[#EED8DE] bg-white text-[#684650] focus:outline-none focus:border-[#C8758B]"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#914B61] block">
                  Bouquet Message Bubbles
                </span>
                {config.bouquetMessages.map((msg, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={msg}
                    onChange={(e) => {
                      const next = [...config.bouquetMessages] as [
                        string,
                        string,
                      ];
                      next[idx] = e.target.value;
                      onChangeConfig({ ...config, bouquetMessages: next });
                    }}
                    placeholder="Use {name} for recipient name"
                    className="w-full px-3 py-2 rounded-xl border border-[#EED8DE] bg-white text-[#684650] focus:outline-none focus:border-[#C8758B]"
                  />
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#914B61] block">
                  Heartfelt Letter
                </span>
                <input
                  type="text"
                  value={config.letter.greeting}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      letter: { ...config.letter, greeting: e.target.value },
                    })
                  }
                  placeholder="Dear {name},"
                  className="w-full px-3 py-2 rounded-xl border border-[#EED8DE] bg-white text-[#684650] focus:outline-none focus:border-[#C8758B]"
                />
                <textarea
                  rows={7}
                  value={config.letter.body}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      letter: { ...config.letter, body: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#EED8DE] bg-white text-[#684650] leading-relaxed focus:outline-none focus:border-[#C8758B]"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-[#914B61] block mb-2">
                  Pastel Theme Palette
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((preset) => {
                    const selected =
                      preset.theme.accent === config.theme.accent;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          onChangeConfig({ ...config, theme: preset.theme })
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          selected
                            ? 'border-[#914B61] bg-[#FFF1F4] text-[#914B61]'
                            : 'border-[#EED8DE] bg-white text-[#684650] hover:bg-[#FFF7F8]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0"
                          style={{ backgroundColor: preset.theme.primary }}
                        />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EED8DE]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#684650]">
                    Enable Microphone Candle Blow
                  </span>
                  <input
                    type="checkbox"
                    checked={config.enableMicrophone}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        enableMicrophone: e.target.checked,
                      })
                    }
                    className="accent-[#C8758B] w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#684650]">
                    Enable Share &amp; QR Buttons
                  </span>
                  <input
                    type="checkbox"
                    checked={config.enableSharing}
                    onChange={(e) =>
                      onChangeConfig({
                        ...config,
                        enableSharing: e.target.checked,
                      })
                    }
                    className="accent-[#C8758B] w-4 h-4"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => onChangeConfig(defaultBirthdayConfig)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A27B84] hover:text-[#914B61] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default Template
              </button>
            </>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              <p className="text-xs text-[#A27B84] leading-relaxed">
                Add cherished photos to appear in the final birthday celebration
                stage. Upload from your device or import directly from Google
                Drive.
              </p>

              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C8758B] text-white text-xs font-bold cursor-pointer hover:bg-[#914B61] transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  Add From Device
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void handleLocalPhotoAdd(e)}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setActiveTab('drive')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#EED8DE] bg-white text-[#684650] text-xs font-bold hover:bg-[#FFF1F4] cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-[#914B61]" />
                  Browse Drive Photos
                </button>
              </div>

              {config.keepsakePhotos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EED8DE] bg-[#FFF7F8] p-6 text-center text-xs text-[#A27B84]">
                  No keepsake photos added yet. Your 7-stage story stays clean
                  and minimal until you attach photos here.
                </div>
              ) : (
                <div className="space-y-3">
                  {config.keepsakePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#EED8DE]"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#FFF1F4]"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          value={photo.caption || ''}
                          placeholder="Add a sweet caption..."
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              keepsakePhotos: config.keepsakePhotos.map((p) =>
                                p.id === photo.id
                                  ? { ...p, caption: e.target.value }
                                  : p
                              ),
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#EED8DE] text-[#684650]"
                        />
                        <div className="flex items-center gap-3">
                          {!needsAuth && !photo.driveFileId && (
                            <button
                              type="button"
                              onClick={() => void handleUploadPhotoToDrive(photo)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#914B61] hover:underline cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              Save to Drive
                            </button>
                          )}
                          {photo.driveFileId && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#63A88A]">
                              <Check className="w-3 h-3" />
                              In Drive
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              onChangeConfig({
                                ...config,
                                keepsakePhotos: config.keepsakePhotos.filter(
                                  (p) => p.id !== photo.id
                                ),
                              })
                            }
                            className="text-[11px] font-semibold text-[#A27B84] hover:text-[#914B61] cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-5">
              {needsAuth ? (
                <div className="rounded-3xl bg-[#FFF7F8] border border-[#EED8DE] p-5 text-center space-y-4">
                  <Cloud className="w-8 h-8 text-[#C8758B] mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-serif-editorial font-semibold text-lg text-[#914B61]">
                      Connect Google Drive
                    </h3>
                    <p className="text-xs text-[#A27B84] leading-relaxed">
                      Save personalized birthday wishes and import keepsake
                      photos across your devices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleGoogleLogin()}
                    disabled={isLoggingIn}
                    className="gsi-material-button mx-auto"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          style={{ display: 'block' }}
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <>
                  {/* Connected Account Bar */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FFF7F8] border border-[#EED8DE]">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#914B61] truncate">
                        {user?.displayName || 'Google Drive Connected'}
                      </p>
                      <p className="text-[11px] text-[#A27B84] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#A27B84] hover:text-[#914B61] cursor-pointer shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>

                  {/* Save / Update Actions */}
                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton
                      onClick={() => void handleSaveNewToDrive()}
                      disabled={driveLoading}
                      accentColor={config.theme.accent}
                      deepAccentColor={config.theme.deepAccent}
                      className="flex-1 text-xs px-4 py-2.5 min-h-[40px]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save as New Wish
                    </PrimaryButton>

                    {config.id && (
                      <PrimaryButton
                        variant="secondary"
                        onClick={requestOverwriteWish}
                        disabled={driveLoading}
                        className="text-xs px-4 py-2.5 min-h-[40px]"
                      >
                        Update Existing
                      </PrimaryButton>
                    )}
                  </div>

                  {driveStatusMsg && (
                    <p className="text-xs text-[#3D785E] bg-[#EAF8EE] border border-[#C3E5CE] rounded-xl px-3.5 py-2">
                      {driveStatusMsg}
                    </p>
                  )}

                  {driveError && (
                    <p className="text-xs text-[#914B61] bg-[#FFF1F4] border border-[#EED8DE] rounded-xl px-3.5 py-2">
                      {driveError}
                    </p>
                  )}

                  {/* Saved Wishes in Drive */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#914B61]">
                        Saved Wishes in Drive
                      </h3>
                      {driveLoading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8758B]" />
                      )}
                    </div>

                    {savedWishes.length === 0 ? (
                      <p className="text-xs text-[#A27B84] bg-white border border-[#EED8DE] rounded-2xl p-4">
                        No saved birthday wishes in your &ldquo;Birthday
                        Wishes&rdquo; folder yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {savedWishes.map((w) => (
                          <div
                            key={w.fileId}
                            className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-[#EED8DE]"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#684650] truncate">
                                {w.name}
                              </p>
                              <p className="text-[11px] text-[#A27B84]">
                                {new Date(w.modifiedTime).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => void handleLoadWish(w)}
                                disabled={driveLoading}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF1F4] text-[#914B61] text-xs font-bold hover:bg-[#F9DDE4] cursor-pointer"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                Load
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDeleteWish(w)}
                                disabled={driveLoading}
                                aria-label={`Delete ${w.name}`}
                                className="p-1.5 rounded-lg text-[#A27B84] hover:text-[#914B61] hover:bg-[#FFF1F4] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Import Photos from Google Drive */}
                  <div className="space-y-2 pt-2 border-t border-[#EED8DE]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#914B61]">
                      Import Keepsake Photos from Drive
                    </h3>
                    {driveImages.length === 0 ? (
                      <p className="text-xs text-[#A27B84] bg-white border border-[#EED8DE] rounded-2xl p-4">
                        No image files found in your Google Drive.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {driveImages.slice(0, 8).map((img) => (
                          <div
                            key={img.fileId}
                            className="p-2 rounded-2xl bg-white border border-[#EED8DE] flex flex-col gap-2"
                          >
                            <div className="aspect-square rounded-xl overflow-hidden bg-[#FFF1F4] flex items-center justify-center">
                              {img.thumbnailLink ? (
                                <img
                                  src={img.thumbnailLink}
                                  alt={img.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImagePlus className="w-5 h-5 text-[#C8758B]" />
                              )}
                            </div>
                            <p className="text-[11px] font-semibold text-[#684650] truncate">
                              {img.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => void handleImportDrivePhoto(img)}
                              disabled={driveLoading}
                              className="w-full py-1.5 rounded-lg bg-[#FFF1F4] text-[#914B61] text-[11px] font-bold hover:bg-[#F9DDE4] cursor-pointer"
                            >
                              Add to Keepsakes
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explicit Confirmation Modal for Overwrite or Delete */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-[60] bg-[#3B212A]/50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="drive-confirm-title"
        >
          <div className="bg-white border border-[#EED8DE] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3
              id="drive-confirm-title"
              className="font-serif-editorial font-semibold text-xl text-[#914B61]"
            >
              {pendingConfirm.title}
            </h3>
            <p className="text-sm text-[#684650] leading-relaxed">
              {pendingConfirm.description}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <PrimaryButton
                variant="secondary"
                onClick={() => setPendingConfirm(null)}
                disabled={confirmBusy}
                className="px-5 py-2 min-h-[40px] text-xs"
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={() => void runConfirmedAction()}
                disabled={confirmBusy}
                accentColor={
                  pendingConfirm.tone === 'danger'
                    ? '#B64962'
                    : config.theme.accent
                }
                deepAccentColor={
                  pendingConfirm.tone === 'danger'
                    ? '#913248'
                    : config.theme.deepAccent
                }
                className="px-5 py-2 min-h-[40px] text-xs"
              >
                {confirmBusy ? 'Working...' : pendingConfirm.confirmLabel}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
