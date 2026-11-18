import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Download,
  QrCode,
  RotateCcw,
  Share2,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { BirthdayConfig } from '../types/birthday';
import { formatPersonalizedText } from '../config/birthdayConfig';
import { BirthdayIllustration } from '../components/BirthdayIllustration';
import { PrimaryButton } from '../components/PrimaryButton';
import { triggerPastelConfetti } from '../components/ConfettiEffect';
import { buildShareUrl } from '../utils/shareLink';

interface FinalStageProps {
  config: BirthdayConfig;
  onReplay: () => void;
}

export const FinalStage: React.FC<FinalStageProps> = ({ config, onReplay }) => {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    triggerPastelConfetti('burst');
  }, []);

  const shareUrl = buildShareUrl(config);

  const handleShare = async () => {
    const shareTitle = `${config.greeting}, ${config.recipientName}!`;
    const shareText = `Open this birthday wish made for ${config.recipientName}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User canceled or unsupported; fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleOpenQr = async () => {
    try {
      const url = await QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#914B61',
          light: '#FFF7F8',
        },
      });
      setQrDataUrl(url);
      setQrOpen(true);
    } catch {
      setQrOpen(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `birthday-wish-${config.recipientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 text-center flex flex-col items-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-serif-editorial font-medium text-xl sm:text-2xl text-[#684650] mb-2"
      >
        {formatPersonalizedText(
          config.finalMessage,
          config.recipientName,
          config.senderName
        )}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full my-1 animate-float-slow"
      >
        <BirthdayIllustration variant="final" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="font-handwritten font-bold text-4xl sm:text-5xl text-[#914B61] leading-tight text-balance mt-3"
      >
        Once Again, Happy Birthday {config.recipientName} 🎀 💖
      </motion.h2>

      {/* Optional Keepsake Photo Memories (preserved clean when empty) */}
      {config.keepsakePhotos.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          aria-label="Keepsake memories"
          className="w-full mt-7"
        >
          <h3 className="font-serif-editorial text-lg text-[#914B61] mb-4">
            Cherished Memories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {config.keepsakePhotos.map((photo) => (
              <figure
                key={photo.id}
                className="bg-white p-2.5 rounded-2xl border border-[#EED8DE] shadow-card-soft flex flex-col gap-2"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#FFF1F4]">
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {photo.caption && (
                  <figcaption className="text-xs text-[#684650] truncate px-1">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </motion.section>
      )}

      {/* Action Buttons */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
        <PrimaryButton
          onClick={onReplay}
          accentColor={config.theme.accent}
          deepAccentColor={config.theme.deepAccent}
        >
          <RotateCcw className="w-4 h-4" />
          Replay
        </PrimaryButton>

        {config.enableSharing && (
          <>
            <PrimaryButton
              variant="secondary"
              onClick={() => void handleShare()}
              accentColor={config.theme.accent}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#63A88A]" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#914B61]" />
                  Share this birthday surprise
                </>
              )}
            </PrimaryButton>

            <PrimaryButton
              variant="secondary"
              onClick={() => void handleOpenQr()}
              accentColor={config.theme.accent}
              aria-label="Show QR code for sharing"
            >
              <QrCode className="w-4 h-4 text-[#914B61]" />
              QR Code
            </PrimaryButton>
          </>
        )}
      </div>

      {/* Unobtrusive footer */}
      <footer className="mt-10 text-xs text-[#A27B84]">
        Made with warmth for {config.recipientName} · From {config.senderName}
      </footer>

      {/* QR Code Modal */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#3B212A]/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Shareable Birthday Wish QR Code"
        >
          <div className="relative bg-white border border-[#EED8DE] rounded-3xl p-6 max-w-xs w-full shadow-card-soft flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              aria-label="Close QR modal"
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#684650] hover:bg-[#FFF1F4] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-serif-editorial font-semibold text-xl text-[#914B61]">
              Scan to Open Wish
            </h3>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR code linking to personalized birthday wish"
                className="w-52 h-52 rounded-2xl border border-[#EED8DE]"
              />
            )}
            <PrimaryButton
              onClick={handleDownloadQr}
              accentColor={config.theme.accent}
              deepAccentColor={config.theme.deepAccent}
              className="w-full"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};
