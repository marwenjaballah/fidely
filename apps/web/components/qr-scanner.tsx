'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { Camera, SwitchCamera, AlertCircle, RefreshCw, Zap, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  containerId?: string;
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  containerId = 'qr-reader-container',
}: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = useCallback(
    async (cameraIdOrFacing: string | { facingMode: string }) => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }

      try {
        await scannerRef.current.start(
          cameraIdOrFacing,
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            // Throttle duplicate reads
            try {
              scannerRef.current?.pause(true);
              setTimeout(() => {
                try {
                  scannerRef.current?.resume();
                } catch {}
              }, 2000);
            } catch {}
          },
          (errorMessage) => {
            if (onScanError) {
              onScanError(errorMessage);
            }
          }
        );

        // Check torch capability
        try {
          const capabilities = (scannerRef.current as any).getRunningTrackCapabilities?.();
          if (capabilities && 'torch' in capabilities) {
            setSupportsTorch(true);
          }
        } catch {}

        setIsInitializing(false);
      } catch (err) {
        console.error('Failed to start QR scanner:', err);
        setIsInitializing(false);
      }
    },
    [onScanSuccess, onScanError]
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (isMounted) {
          if (devices && devices.length > 0) {
            setCameras(devices);
            setHasPermission(true);
            // Default to environment (back) camera
            await startScanner({ facingMode: 'environment' });
          } else {
            setHasPermission(false);
            setIsInitializing(false);
          }
        }
      } catch (err) {
        console.error('Error querying cameras:', err);
        if (isMounted) {
          setHasPermission(false);
          setIsInitializing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [startScanner]);

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    const nextCam = cameras[nextIndex];
    if (nextCam) {
      setIsInitializing(true);
      await startScanner(nextCam.id);
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !supportsTorch) return;
    try {
      const nextState = !isTorchOn;
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-3xl border border-destructive/30 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <h3 className="text-base font-bold text-foreground">Camera Access Required</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Please allow camera permissions in your browser or device settings to scan customer loyalty passes.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-xs gap-1.5 mt-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Permission
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-3xl shadow-2xl bg-black border-2 border-border/80 group">
      {/* Scanner Viewport */}
      <div id={containerId} className="w-full aspect-square bg-black" />

      {/* Target Framing Reticle & Laser Sweep */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Reticle Box */}
        <div className="relative w-[260px] h-[260px]">
          {/* Top-Left Corner */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-sm" />
          {/* Top-Right Corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-sm" />
          {/* Bottom-Left Corner */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-sm" />
          {/* Bottom-Right Corner */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-sm" />

          {/* Animated Sweeping Laser Scan Line */}
          <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse duration-1000 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Top Camera Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-medium text-white/90 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Align QR code in box</span>
        </div>

        <div className="flex items-center gap-1.5">
          {supportsTorch && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleTorch}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80"
              title="Toggle Flashlight"
            >
              {isTorchOn ? <Zap className="w-4 h-4 text-amber-400" /> : <ZapOff className="w-4 h-4 text-white/70" />}
            </Button>
          )}

          {cameras.length > 1 && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleSwitchCamera}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80"
              title="Switch Camera"
            >
              <SwitchCamera className="w-4 h-4 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Loading Spinner */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-20">
          <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
          <span className="text-xs font-semibold">Starting camera feed...</span>
        </div>
      )}
    </div>
  );
}
