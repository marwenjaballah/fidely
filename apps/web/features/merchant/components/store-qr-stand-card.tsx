'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Coffee,
  Sparkles,
  Smartphone,
  ExternalLink,
  Printer,
  Share2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoreQRStandCardProps {
  store: {
    id: string;
    name: string;
    slug: string;
    primaryColor: string;
    logoUrl?: string | null;
    pointsPerTnd?: number;
  };
}

export function StoreQRStandCard({ store }: StoreQRStandCardProps) {
  const { toast } = useToast();
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
  const primaryColor = store.primaryColor || '#D97706';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast({
      title: 'Invite Link Copied!',
      description: 'Customers scanning this link will be automatically credited to your store.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Generates and downloads a high-resolution (1200x1600px) print-ready table tent poster.
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

      // 1. Background clean gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.35, '#1e293b');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Top brand accent glow
      const topGlow = ctx.createRadialGradient(width / 2, 200, 10, width / 2, 200, 450);
      topGlow.addColorStop(0, `${primaryColor}44`);
      topGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, 600);

      // 2. Outer border frame
      ctx.strokeStyle = `${primaryColor}66`;
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Inner elegant corner accents
      const cornerSize = 40;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 8;
      // TL
      ctx.beginPath();
      ctx.moveTo(40, 40 + cornerSize);
      ctx.lineTo(40, 40);
      ctx.lineTo(40 + cornerSize, 40);
      ctx.stroke();
      // TR
      ctx.beginPath();
      ctx.moveTo(width - 40 - cornerSize, 40);
      ctx.lineTo(width - 40, 40);
      ctx.lineTo(width - 40, 40 + cornerSize);
      ctx.stroke();
      // BL
      ctx.beginPath();
      ctx.moveTo(40, height - 40 - cornerSize);
      ctx.lineTo(40, height - 40);
      ctx.lineTo(40 + cornerSize, height - 40);
      ctx.stroke();
      // BR
      ctx.beginPath();
      ctx.moveTo(width - 40 - cornerSize, height - 40);
      ctx.lineTo(width - 40, height - 40);
      ctx.lineTo(width - 40, height - 40 - cornerSize);
      ctx.stroke();

      // 3. Draw Store Logo or Icon
      let currentY = 160;
      if (store.logoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = store.logoUrl!;
          });
          const logoSize = 140;
          ctx.save();
          ctx.beginPath();
          ctx.arc(width / 2, currentY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, width / 2 - logoSize / 2, currentY, logoSize, logoSize);
          ctx.restore();
          currentY += logoSize + 40;
        } catch {
          currentY += 40;
        }
      } else {
        currentY += 40;
      }

      // 4. Store Name & Loyalty Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(store.name.toUpperCase(), width / 2, currentY);

      currentY += 50;
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 36px Inter, system-ui, sans-serif';
      ctx.fillText('LOYALTY REWARDS CLUB', width / 2, currentY);

      currentY += 60;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 28px Inter, system-ui, sans-serif';
      ctx.fillText(`Earn points with every cup (1 TND = ${pointsPerTnd} pts)`, width / 2, currentY);

      // 5. Render High-Res QR Code onto Canvas
      currentY += 60;
      const qrBoxSize = 520;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = currentY;

      // White rounded background card for QR code
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 40);
      ctx.fill();

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

        const qrPad = 40;
        ctx.drawImage(qrImg, qrBoxX + qrPad, qrBoxY + qrPad, qrBoxSize - qrPad * 2, qrBoxSize - qrPad * 2);
        URL.revokeObjectURL(blobURL);
      }

      // 6. Action Callout & Instructions
      currentY = qrBoxY + qrBoxSize + 80;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Inter, system-ui, sans-serif';
      ctx.fillText('SCAN WITH YOUR PHONE', width / 2, currentY);

      currentY += 45;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 26px Inter, system-ui, sans-serif';
      ctx.fillText('Point your camera to join our loyalty pass in Apple Wallet / Web', width / 2, currentY);

      // 7. Step bubbles at bottom
      currentY += 90;
      const steps = [
        '1. Open Camera',
        '2. Scan & Sign Up',
        '3. Collect Rewards',
      ];
      const stepWidth = 320;
      const startX = (width - (steps.length * stepWidth)) / 2;

      steps.forEach((stepText, idx) => {
        const bx = startX + idx * stepWidth + 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.roundRect(bx, currentY, stepWidth - 40, 64, 16);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 20px Inter, system-ui, sans-serif';
        ctx.fillText(stepText, bx + (stepWidth - 40) / 2, currentY + 39);
      });

      // 8. Footer Brand Mark
      ctx.fillStyle = '#64748b';
      ctx.font = '500 20px Inter, system-ui, sans-serif';
      ctx.fillText('Powered by Fidely Loyalty System • fidely.app', width / 2, height - 70);

      // 9. Download Trigger
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${store.slug}-table-stand-poster.png`;
      downloadLink.click();

      toast({
        title: 'Printable Poster Downloaded!',
        description: 'High-res counter stand artwork ready for printing on A5/A6 acrylic stands.',
      });
    } catch (e: any) {
      console.error('Failed to generate poster:', e);
      toast({
        title: 'Download Failed',
        description: 'Could not generate poster image.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Downloads raw transparent PNG QR code.
   */
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
        toast({ title: 'QR Code Downloaded' });
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
                Store QR Stand & Marketing Flyer
              </CardTitle>
              <CardDescription className="text-xs">
                Print this table-tent poster for your counter. Customers scan to join your loyalty club instantly.
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold self-start sm:self-auto">
            Auto-Referral Link
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Acrylic Counter Table Stand Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Visual Acrylic Frame */}
            <div className="relative w-full max-w-[280px] sm:max-w-[300px] rounded-3xl p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl border-4 border-slate-700/60 flex flex-col items-center text-center space-y-4">
              {/* Top ambient color glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Logo / Store Name */}
              <div className="space-y-1.5 pt-2">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-2xl object-cover mx-auto border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/10">
                    <Coffee className="w-6 h-6" />
                  </div>
                )}
                <h3 className="font-black text-lg tracking-tight uppercase leading-tight">{store.name}</h3>
                <span className="text-[11px] font-bold tracking-wider uppercase block" style={{ color: primaryColor }}>
                  Loyalty Club
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100">
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
                  1 TND = {pointsPerTnd} points • Apple Wallet Ready
                </p>
              </div>

              {/* Acrylic Stand Base Simulator */}
              <div className="absolute -bottom-4 w-[110%] h-3 bg-slate-700 rounded-full shadow-md border-t border-slate-500" />
            </div>
            <span className="text-[11px] text-muted-foreground mt-6 font-medium">
              Counter Stand Live Artwork Preview
            </span>
          </div>

          {/* Action Tools & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h4 className="text-base font-bold text-foreground">How Customer Auto-Referral Works:</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <span>
                    <strong>Customer Scans Stand</strong>: Opens your public store loyalty pass on their smartphone camera.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <span>
                    <strong>One-Tap Join & Sign Up</strong>: If new, their sign-up form is tagged with your store referral code and automatically creates their membership upon completion.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <span>
                    <strong>Super Admin Analytics</strong>: Platform admins track that this customer was acquired via your store&apos;s counter stand.
                  </span>
                </li>
              </ul>
            </div>

            {/* Direct Link Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Store Invite & Referral URL
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
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                onClick={handleDownloadPoster}
                disabled={isGenerating}
                className="h-12 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 gap-2"
              >
                <Printer className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download Printable Stand (PNG)'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadRawQR}
                className="h-12 rounded-xl text-xs font-bold gap-2"
              >
                <Download className="w-4 h-4" />
                Download Raw QR Image
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
