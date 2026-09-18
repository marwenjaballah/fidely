'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Store,
  Sparkles,
  Printer,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

interface StoreQRStandCardProps {
  store: {
    id: string;
    name: string;
    slug: string;
    primaryColor: string;
    logoUrl?: string | null;
    pointsPerTnd?: number;
    welcomePoints?: number;
  };
}

export function StoreQRStandCard({ store }: StoreQRStandCardProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const qrUrl = `${origin}/store/${store.slug}?ref=${store.id}`;
  const pointsPerTnd = store.pointsPerTnd || 10;
  const primaryColor = store.primaryColor || '#4F46E5';
  const welcomePoints = store.welcomePoints || 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast({
      title: t('stand_toast_copied'),
      description: t('stand_toast_copied_desc'),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * 1-Click Ready-to-Print A5/A6 Acrylic Counter Stand
   * Strictly SHADOW-FREE, vector-crisp lines for perfect laser/inkjet printing.
   */
  const handlePrintStand = () => {
    const svgElement = document.getElementById(`store-qr-svg-${store.id}`);
    if (!svgElement) return;

    const svgXml = new XMLSerializer().serializeToString(svgElement);
    const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgXml)}`;

    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      toast({
        title: t('auth_generic_error'),
        description: 'Please allow popups to open the print preview.',
        variant: 'destructive',
      });
      return;
    }

    const welcomeBonusHtml = welcomePoints > 0 ? `
      <div class="welcome-gift-badge">
        ✨ GET +${welcomePoints} FREE WELCOME POINTS ON SIGNUP!
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${store.name} - Counter Stand (A5/A6 Print)</title>
          <style>
            @page {
              size: A5 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: #ffffff;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 10px;
            }
            .stand-container {
              width: 130mm;
              height: 190mm;
              border: 3px solid #0f172a;
              border-radius: 8mm;
              padding: 8mm 6mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              background: #ffffff;
              position: relative;
            }
            .corner-cut-guide {
              position: absolute;
              width: 6mm;
              height: 6mm;
              border-color: #94a3b8;
              border-style: solid;
            }
            .tl { top: -2px; left: -2px; border-width: 2px 0 0 2px; }
            .tr { top: -2px; right: -2px; border-width: 2px 2px 0 0; }
            .bl { bottom: -2px; left: -2px; border-width: 0 0 2px 2px; }
            .br { bottom: -2px; right: -2px; border-width: 0 2px 2px 0; }
            .header {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2.5mm;
            }
            .brand-badge {
              display: inline-block;
              padding: 2mm 5mm;
              background: #0f172a;
              color: #ffffff;
              font-size: 3.2mm;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              border-radius: 3mm;
            }
            .store-name {
              font-size: 8mm;
              font-weight: 900;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              color: #0f172a;
              line-height: 1.1;
              max-width: 110mm;
            }
            .multiplier-tag {
              font-size: 3.5mm;
              font-weight: 700;
              color: #334155;
            }
            .welcome-gift-badge {
              display: inline-block;
              padding: 1.5mm 4mm;
              background: #f8fafc;
              border: 1.5px solid #0f172a;
              color: #0f172a;
              font-size: 2.8mm;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              border-radius: 2.5mm;
            }
            .qr-wrapper {
              background: #ffffff;
              border: 2.5px solid #0f172a;
              border-radius: 6mm;
              padding: 5mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-img {
              width: 55mm;
              height: 55mm;
              display: block;
            }
            .action-box {
              display: flex;
              flex-direction: column;
              gap: 1.5mm;
            }
            .action-title {
              font-size: 5mm;
              font-weight: 900;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #0f172a;
            }
            .action-sub {
              font-size: 3.2mm;
              color: #475569;
              font-weight: 500;
            }
            .steps-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 2mm;
              width: 100%;
            }
            .step-pill {
              border: 1.5px solid #cbd5e1;
              border-radius: 3mm;
              padding: 2mm 1mm;
              font-size: 2.6mm;
              font-weight: 700;
              color: #1e293b;
            }
            .footer-mark {
              font-size: 2.5mm;
              color: #94a3b8;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="stand-container">
            <div class="corner-cut-guide tl"></div>
            <div class="corner-cut-guide tr"></div>
            <div class="corner-cut-guide bl"></div>
            <div class="corner-cut-guide br"></div>

            <div class="header">
              <div class="brand-badge">Loyalty Pass</div>
              <div class="store-name">${store.name}</div>
              <div class="multiplier-tag">1 TND Spent = ${pointsPerTnd} Reward Points</div>
              ${welcomeBonusHtml}
            </div>

            <div class="qr-wrapper">
              <img src="${svgDataUri}" class="qr-img" alt="Store QR Code" />
            </div>

            <div class="action-box">
              <div class="action-title">Scan to Join & Collect Points</div>
              <div class="action-sub">Open your smartphone camera to add to Fidely Wallet</div>
            </div>

            <div class="steps-grid">
              <div class="step-pill">1. Open Camera</div>
              <div class="step-pill">2. Tap Pass Link</div>
              <div class="step-pill">3. Earn Rewards</div>
            </div>

            <div class="footer-mark">
              FIDELY LOYALTY SYSTEM • ACRYLIC COUNTER STAND INSERT (A5/A6)
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /**
   * Generates and downloads a clean, high-contrast, shadow-free PNG poster.
   */
  const handleDownloadPoster = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const width = 1200;
      const height = 1600;
      canvas.width = width;
      canvas.height = height;

      // 1. Clean solid background (Pure sharp contrast, zero blurry shadows)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // 2. Outer crisp frame
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Inner corner brackets
      const cornerSize = 48;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 8;
      // TL
      ctx.beginPath();
      ctx.moveTo(50, 50 + cornerSize);
      ctx.lineTo(50, 50);
      ctx.lineTo(50 + cornerSize, 50);
      ctx.stroke();
      // TR
      ctx.beginPath();
      ctx.moveTo(width - 50 - cornerSize, 50);
      ctx.lineTo(width - 50, 50);
      ctx.lineTo(width - 50, 50 + cornerSize);
      ctx.stroke();
      // BL
      ctx.beginPath();
      ctx.moveTo(50, height - 50 - cornerSize);
      ctx.lineTo(50, height - 50);
      ctx.lineTo(50 + cornerSize, height - 50);
      ctx.stroke();
      // BR
      ctx.beginPath();
      ctx.moveTo(width - 50 - cornerSize, height - 50);
      ctx.lineTo(width - 50, height - 50);
      ctx.lineTo(width - 50, height - 50 - cornerSize);
      ctx.stroke();

      let currentY = 170;

      // 3. Store Name & Loyalty Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(store.name.toUpperCase(), width / 2, currentY);

      currentY += 52;
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 34px Inter, system-ui, sans-serif';
      ctx.fillText('LOYALTY REWARDS CLUB', width / 2, currentY);

      currentY += 54;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 26px Inter, system-ui, sans-serif';
      ctx.fillText(`Earn points with every purchase (1 TND = ${pointsPerTnd} pts)`, width / 2, currentY);

      // Optional Welcome Bonus Badge on Poster
      if (welcomePoints > 0) {
        currentY += 42;
        const badgeText = `✨ +${welcomePoints} BONUS POINTS ON SIGNUP!`;
        ctx.font = 'bold 24px Inter, system-ui, sans-serif';
        const textWidth = ctx.measureText(badgeText).width;
        const badgePadX = 26;
        const badgeW = textWidth + badgePadX * 2;
        const badgeH = 44;
        const badgeX = (width - badgeW) / 2;

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(badgeX, currentY, badgeW, badgeH, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, width / 2, currentY + 30);
      }

      // 4. Render QR Code Container (Crisp solid border, no blur)
      currentY += welcomePoints > 0 ? 50 : 65;
      const qrBoxSize = 500;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = currentY;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Convert SVG QR code to image
      const svgElement = document.getElementById(`store-qr-svg-${store.id}`);
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const qrImg = new Image();
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.src = blobURL;
        });

        const qrPad = 44;
        ctx.drawImage(qrImg, qrBoxX + qrPad, qrBoxY + qrPad, qrBoxSize - qrPad * 2, qrBoxSize - qrPad * 2);
        URL.revokeObjectURL(blobURL);
      }

      // 5. Action Callout & Instructions
      currentY = qrBoxY + qrBoxSize + 75;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Inter, system-ui, sans-serif';
      ctx.fillText('SCAN WITH YOUR PHONE', width / 2, currentY);

      currentY += 42;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 24px Inter, system-ui, sans-serif';
      ctx.fillText('Point your smartphone camera to join our loyalty pass', width / 2, currentY);

      // 6. Step bubbles at bottom
      currentY += 75;
      const steps = [
        '1. Open Camera',
        '2. Scan & Sign Up',
        '3. Collect Rewards',
      ];
      const stepWidth = 320;
      const startX = (width - (steps.length * stepWidth)) / 2;

      steps.forEach((stepText, idx) => {
        const bx = startX + idx * stepWidth + 20;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(bx, currentY, stepWidth - 40, 60, 14);
        ctx.fill();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px Inter, system-ui, sans-serif';
        ctx.fillText(stepText, bx + (stepWidth - 40) / 2, currentY + 37);
      });

      // 7. Footer Brand Mark
      ctx.fillStyle = '#64748b';
      ctx.font = '500 20px Inter, system-ui, sans-serif';
      ctx.fillText('Powered by Fidely Loyalty System • fidely.app', width / 2, height - 70);

      // 8. Download Trigger
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${store.slug}-counter-stand-poster.png`;
      downloadLink.click();

      toast({
        title: t('stand_toast_poster_downloaded'),
        description: t('stand_toast_poster_desc'),
      });
    } catch (e: any) {
      console.error('Failed to generate poster:', e);
      toast({
        title: t('auth_generic_error'),
        description: 'Could not generate poster image.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadRawQR = () => {
    const svgElement = document.getElementById(`store-qr-svg-${store.id}`);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 50, 50, 900, 900);
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${store.slug}-qr-code.png`;
        a.click();
        URL.revokeObjectURL(blobURL);
        toast({ title: t('copied') });
      }
    };
    img.src = blobURL;
  };

  return (
    <Card className="border-border/80 bg-card overflow-hidden shadow-xl rounded-3xl">
      <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight">
                {t('stand_title')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('stand_desc')}
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold self-start sm:self-auto">
            {t('stand_badge_auto_referral')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Acrylic Counter Table Stand Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Visual Acrylic Frame (Crisp vector borders, shadow-free print layout) */}
            <div className="relative w-full max-w-[280px] sm:max-w-[300px] rounded-3xl p-6 bg-slate-900 text-white border-4 border-slate-700 flex flex-col items-center text-center space-y-4 shadow-xl">
              {/* Logo / Store Name */}
              <div className="space-y-1.5 pt-2">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-2xl object-cover mx-auto border-2 border-white/20 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/10">
                    <Store className="w-6 h-6" />
                  </div>
                )}
                <h3 className="font-black text-lg tracking-tight uppercase leading-tight">{store.name}</h3>
                <span className="text-[11px] font-bold tracking-wider uppercase block" style={{ color: primaryColor }}>
                  Loyalty Club
                </span>

                {welcomePoints > 0 && (
                  <div className="bg-primary/20 border border-primary/40 rounded-xl px-2.5 py-1 text-[10px] font-bold text-white flex items-center justify-center gap-1 animate-in zoom-in-95">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>+{welcomePoints} {t('pts')}</span>
                  </div>
                )}
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200">
                <QRCodeSVG
                  id={`store-qr-svg-${store.id}`}
                  value={qrUrl}
                  size={160}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>

              {/* Tagline & Steps */}
              <div className="space-y-1 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Scan to Join & Earn Perks
                </span>
                <p className="text-[10px] text-slate-400">
                  1 TND = {pointsPerTnd} {t('points')} • Fidely Wallet Ready
                </p>
              </div>

              {/* Acrylic Stand Base Simulator */}
              <div className="absolute -bottom-4 w-[110%] h-3 bg-slate-700 rounded-full border-t border-slate-500" />
            </div>
            <span className="text-[11px] text-muted-foreground mt-6 font-medium">
              {t('stand_preview_label')}
            </span>
          </div>

          {/* Action Tools & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h4 className="text-base font-bold text-foreground">{t('stand_how_works_title')}</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <span>
                    <strong>{t('stand_step_1_title')}</strong>: {t('stand_step_1_desc')}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <span>
                    <strong>{t('stand_step_2_title')}</strong>: {t('stand_step_2_desc')}{welcomePoints > 0 ? ` (+${welcomePoints} ${t('pts')})` : ''}.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <span>
                    <strong>{t('stand_step_3_title')}</strong>: {t('stand_step_3_desc')}
                  </span>
                </li>
              </ul>
            </div>

            {/* Direct Link Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('stand_referral_url_label')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={qrUrl}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-muted/60 border border-border text-xs font-mono font-medium text-foreground select-all"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-11 px-4 rounded-xl text-xs font-bold gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('copied') : t('copy')}
                </Button>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <Button
                type="button"
                onClick={handlePrintStand}
                className="h-12 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
              >
                <Printer className="w-4 h-4" />
                {t('stand_print_stand_btn')}
              </Button>

              <Button
                type="button"
                onClick={handleDownloadPoster}
                disabled={isGenerating}
                variant="outline"
                className="h-12 rounded-xl text-xs font-bold gap-2"
              >
                <FileText className="w-4 h-4" />
                {isGenerating ? t('loading') : t('stand_download_poster_btn')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadRawQR}
                className="h-12 rounded-xl text-xs font-bold gap-2"
              >
                <Download className="w-4 h-4" />
                {t('stand_download_raw_qr_btn')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
