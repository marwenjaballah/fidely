'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  CameraDevice,
  Html5QrcodeScannerState,
} from 'html5-qrcode';
import {
  Camera,
  SwitchCamera,
  AlertCircle,
  RefreshCw,
  Zap,
  ZapOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  containerId?: string;
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  containerId: customContainerId,
}: QRScannerProps) {
  const { t } = useI18n();
  const reactId = useId().replace(/[:]/g, '_');
  const containerId = customContainerId || `qr-reader-${reactId}`;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const videoObserverRef = useRef<MutationObserver | null>(null);

  const safeStopScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.warn('Error during scanner stop:', err);
    }
  }, []);

  const startScanner = useCallback(
    async (preferredCameraId?: string) => {
      if (isStartingRef.current) return;
      isStartingRef.current = true;
      setIsInitializing(true);
      setPermissionError(null);

      // Verify DOM element exists
      const containerEl = document.getElementById(containerId);
      if (!containerEl) {
        isStartingRef.current = false;
        setIsInitializing(false);
        return;
      }

      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(containerId, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          });
        }

        // Safely stop if already active
        await safeStopScanner();
        if (!isMountedRef.current) return;

        // ─────────────────────────────────────────────────────────────────────
        // STEP 1: Enumerate cameras FIRST (this is the ONLY getUserMedia call).
        // On mobile, calling getCameras() AFTER start() issues a second
        // getUserMedia which kills the already-running stream — exactly the
        // "video appears then disappears" bug.
        // ─────────────────────────────────────────────────────────────────────
        let cameraId = preferredCameraId;

        if (!cameraId) {
          try {
            const devices = await Html5Qrcode.getCameras();
            if (isMountedRef.current && devices && devices.length > 0) {
              setCameras(devices);

              // Prefer a rear-facing camera by label heuristic
              const rear = devices.find((d) =>
                /back|rear|environment|0/i.test(d.label)
              );
              // If only one camera, use it; otherwise prefer rear or last device
              cameraId =
                rear?.id ??
                (devices.length > 1 ? devices[devices.length - 1].id : devices[0].id);
            }
          } catch {
            // getCameras failed (can happen if permission was previously denied
            // and the user hasn't reset it). Fall through to facingMode strategy.
          }
        }

        if (!isMountedRef.current) return;

        const scanSuccessHandler = (decodedText: string) => {
          if (!isMountedRef.current) return;
          onScanSuccess(decodedText);
        };

        const scanErrorHandler = (errorMessage: string) => {
          if (onScanError && isMountedRef.current) {
            onScanError(errorMessage);
          }
        };

        // fps: 10 is sufficient and less CPU-heavy on mobile.
        // Do NOT include aspectRatio — causes OverconstrainedError on iOS.
        const scanConfig = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: edgeSize, height: edgeSize };
          },
        };

        // ─────────────────────────────────────────────────────────────────────
        // STEP 2: Attach a MutationObserver BEFORE calling start() so we can
        // set playsinline/muted the instant html5-qrcode injects <video>.
        // This must happen before start() to avoid a race on slow mobile CPUs.
        // ─────────────────────────────────────────────────────────────────────
        const ensureVideoPlayback = (video: HTMLVideoElement) => {
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.setAttribute('autoplay', 'true');
          video.setAttribute('muted', 'true');
          video.setAttribute('width', String(containerEl.offsetWidth || 320));
          video.setAttribute('height', String(containerEl.offsetHeight || 320));
          video.muted = true;
          video.playsInline = true;
          video.play().catch(() => {});
        };

        videoObserverRef.current?.disconnect();
        const existingVideo = containerEl.querySelector('video');
        if (existingVideo) {
          ensureVideoPlayback(existingVideo as HTMLVideoElement);
        } else {
          const observer = new MutationObserver(() => {
            const video = containerEl.querySelector('video');
            if (video) {
              ensureVideoPlayback(video as HTMLVideoElement);
              observer.disconnect();
            }
          });
          observer.observe(containerEl, { childList: true, subtree: true });
          videoObserverRef.current = observer;
        }

        // ─────────────────────────────────────────────────────────────────────
        // STEP 3: Start with concrete camera ID when available, otherwise fall
        // back to facingMode hints (which can cause OverconstrainedError on some
        // Android devices — the explicit ID path avoids that entirely).
        // ─────────────────────────────────────────────────────────────────────
        if (cameraId) {
          await scannerRef.current.start(
            cameraId,
            scanConfig,
            scanSuccessHandler,
            scanErrorHandler
          );
        } else {
          // Last resort: use facingMode without any device enumeration
          try {
            await scannerRef.current.start(
              { facingMode: 'environment' },
              scanConfig,
              scanSuccessHandler,
              scanErrorHandler
            );
          } catch {
            if (!isMountedRef.current) return;
            await scannerRef.current.start(
              { facingMode: 'user' },
              scanConfig,
              scanSuccessHandler,
              scanErrorHandler
            );
          }
        }

        // Belt-and-suspenders: if video is already present post-start, ensure attrs
        const videoNow = containerEl.querySelector('video');
        if (videoNow) ensureVideoPlayback(videoNow as HTMLVideoElement);

        if (!isMountedRef.current) return;

        setHasPermission(true);
        setPermissionError(null);

        // Check torch capability (no extra getUserMedia needed here)
        try {
          const capabilities = (scannerRef.current as any).getRunningTrackCapabilities?.();
          if (capabilities && 'torch' in capabilities) {
            setSupportsTorch(true);
          }
        } catch {}

        setIsInitializing(false);
      } catch (err: any) {
        console.error('Failed to start camera QR scanner:', err);
        if (isMountedRef.current) {
          setHasPermission(false);
          const errorMsg =
            err?.name === 'NotAllowedError' || err?.message?.includes('Permission')
              ? 'Camera permission was denied. Please allow camera access in your browser settings.'
              : err?.name === 'OverconstrainedError'
              ? 'Camera constraint error. Please try again.'
              : err?.message || 'Unable to start camera feed on this device.';
          setPermissionError(errorMsg);
          setIsInitializing(false);
        }
      } finally {
        isStartingRef.current = false;
      }
    },
    [containerId, onScanSuccess, onScanError, safeStopScanner]
  );

  // Initialize camera on mount
  useEffect(() => {
    isMountedRef.current = true;

    // Small timeout allows DOM container to reliably render
    const timeoutId = setTimeout(() => {
      startScanner();
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      safeStopScanner();
    };
  }, [startScanner, safeStopScanner]);

  // Teardown scanner on full unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      videoObserverRef.current?.disconnect();
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (
            state === Html5QrcodeScannerState.SCANNING ||
            state === Html5QrcodeScannerState.PAUSED
          ) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, []);

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    const nextCam = cameras[nextIndex];
    if (nextCam) {
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-3xl shadow-2xl bg-black border-2 border-border/80 group">
        {/* Scanner HTML5 Container */}
        {/* Note: do NOT use object-cover on mobile – it produces a black frame */}
        {/* when the video dimensions aren't resolved at stream-start time.     */}
        <div
          id={containerId}
          className="w-full h-full bg-black [&_video]:w-full [&_video]:h-full [&_video]:object-fill [&_#qr-shaded-region]:!hidden [&_#qr-shaded-region_*]:!hidden [&_canvas]:!opacity-0 [&_canvas]:!absolute [&_canvas]:!pointer-events-none [&_div]:!border-none"
        />

        {/* Reticle Overlay (Active when camera is running) */}
        {!isInitializing && hasPermission && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-[240px] h-[240px] sm:w-[260px] sm:h-[260px]">
              {/* Reticle Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl shadow-sm" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl shadow-sm" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl shadow-sm" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl shadow-sm" />

              {/* Sweeping Laser Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1] animate-pulse duration-1000 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Top Controls Overlay */}
        {!isInitializing && hasPermission && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-medium text-white/90 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span>{t('scanner_instruction')}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {supportsTorch && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleTorch}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80"
                  title={t('scanner_torch_toggle')}
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
                  title={t('scanner_switch_camera')}
                >
                  <SwitchCamera className="w-4 h-4 text-white" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Initializing Spinner Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2.5 z-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center space-y-0.5">
              <p className="text-xs font-bold text-white">{t('loading')}</p>
              <p className="text-[11px] text-white/60">{t('scanner_camera_permission')}</p>
            </div>
          </div>
        )}

        {/* Camera Error / Permission Blocked Overlay */}
        {!isInitializing && hasPermission === false && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3.5 z-20">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">{t('scanner_camera_error')}</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                {permissionError || t('scanner_camera_permission')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => startScanner()}
                className="text-xs font-semibold rounded-xl gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('refresh')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
