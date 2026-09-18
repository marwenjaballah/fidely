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
  Upload,
  Keyboard,
  FileImage,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const [activeTab, setActiveTab] = useState<'camera' | 'file' | 'manual'>('camera');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // File scan state
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual input state
  const [manualCode, setManualCode] = useState('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);

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

        const scanSuccessHandler = (decodedText: string) => {
          if (!isMountedRef.current) return;
          onScanSuccess(decodedText);
        };

        const scanErrorHandler = (errorMessage: string) => {
          if (onScanError && isMountedRef.current) {
            onScanError(errorMessage);
          }
        };

        // iOS Safari optimized configuration:
        // Do NOT force aspectRatio: 1.0 (causes OverconstrainedError on iOS).
        // Use dynamic function for qrbox.
        const scanConfig = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: edgeSize, height: edgeSize };
          },
        };

        // Helper to force iOS Safari playsinline & unblock video playback
        const ensureIosVideoPlayback = () => {
          const video = containerEl.querySelector('video');
          if (video) {
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            video.setAttribute('autoplay', 'true');
            video.setAttribute('muted', 'true');
            video.muted = true;
            video.play().catch(() => {});
          }
        };

        // Strategy 1: Explicit camera ID if provided
        if (preferredCameraId) {
          await scannerRef.current.start(
            preferredCameraId,
            scanConfig,
            scanSuccessHandler,
            scanErrorHandler
          );
        } else {
          // Strategy 2: Attempt rear/environment camera (standard iOS facingMode)
          try {
            await scannerRef.current.start(
              { facingMode: 'environment' },
              scanConfig,
              scanSuccessHandler,
              scanErrorHandler
            );
          } catch (envErr) {
            console.warn('Environment camera failed, attempting fallback to user camera:', envErr);
            if (!isMountedRef.current) return;
            // Strategy 3: Fallback to user camera or default
            await scannerRef.current.start(
              { facingMode: 'user' },
              scanConfig,
              scanSuccessHandler,
              scanErrorHandler
            );
          }
        }

        // Apply iOS video attributes immediately after starting
        ensureIosVideoPlayback();
        setTimeout(ensureIosVideoPlayback, 200);
        setTimeout(ensureIosVideoPlayback, 500);

        if (!isMountedRef.current) return;

        setHasPermission(true);
        setPermissionError(null);

        // Check torch capability
        try {
          const capabilities = (scannerRef.current as any).getRunningTrackCapabilities?.();
          if (capabilities && 'torch' in capabilities) {
            setSupportsTorch(true);
          }
        } catch {}

        // Enumerate cameras now that permission is granted
        try {
          const availableDevices = await Html5Qrcode.getCameras();
          if (isMountedRef.current && availableDevices && availableDevices.length > 0) {
            setCameras(availableDevices);
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
              ? 'Camera resolution constraint error. Please try switching cameras or retry.'
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

  // Initialize camera when activeTab is 'camera'
  useEffect(() => {
    isMountedRef.current = true;

    if (activeTab === 'camera') {
      // Small timeout allows DOM container to reliably render
      const timeoutId = setTimeout(() => {
        startScanner();
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        safeStopScanner();
      };
    } else {
      safeStopScanner();
    }

    return () => {
      isMountedRef.current = false;
      safeStopScanner();
    };
  }, [activeTab, startScanner, safeStopScanner]);

  // Teardown scanner on full unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    setFileError(null);

    try {
      let fileScanner = scannerRef.current;
      if (!fileScanner) {
        fileScanner = new Html5Qrcode(containerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = fileScanner;
      }

      const decodedText = await fileScanner.scanFile(file, true);
      if (decodedText) {
        onScanSuccess(decodedText);
      }
    } catch (err: any) {
      console.warn('File QR scan error:', err);
      setFileError('No valid QR code found in this image. Please try another image or enter the code manually.');
    } finally {
      setIsScanningFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-muted/60 backdrop-blur-sm rounded-2xl border border-border/60 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setFileError(null);
            setActiveTab('camera');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'camera'
              ? 'bg-background text-foreground shadow-sm font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span>Camera</span>
        </button>

        <button
          type="button"
          onClick={() => {
            safeStopScanner();
            setFileError(null);
            setActiveTab('file');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'file'
              ? 'bg-background text-foreground shadow-sm font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload</span>
        </button>

        <button
          type="button"
          onClick={() => {
            safeStopScanner();
            setActiveTab('manual');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'manual'
              ? 'bg-background text-foreground shadow-sm font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5 text-amber-500" />
          <span>Enter Code</span>
        </button>
      </div>

      {/* Camera View Mode */}
      <div className={`relative ${activeTab === 'camera' ? 'block' : 'hidden'}`}>
        <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-3xl shadow-2xl bg-black border-2 border-border/80 group">
          {/* Scanner HTML5 Container */}
          <div
            id={containerId}
            className="w-full h-full aspect-square bg-black [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_#qr-shaded-region]:!hidden [&_#qr-shaded-region_*]:!hidden [&_canvas]:!opacity-0 [&_canvas]:!absolute [&_canvas]:!pointer-events-none [&_div]:!border-none"
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('file')}
                  className="text-xs font-semibold rounded-xl gap-1.5"
                >
                  <FileImage className="w-3.5 h-3.5" />
                  Upload Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Mode */}
      {activeTab === 'file' && (
        <div className="bg-card border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-3xl p-6 text-center space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="qr-file-input"
            onChange={handleFileChange}
          />
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            {isScanningFile ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">
              {isScanningFile ? 'Analyzing image...' : 'Upload QR Code Screenshot'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Select or drop a photo or screenshot containing the customer pass QR code.
            </p>
          </div>

          {fileError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive font-medium">
              {fileError}
            </div>
          )}

          <Button
            type="button"
            variant="default"
            disabled={isScanningFile}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-11 rounded-xl text-xs font-bold gap-2"
          >
            <FileImage className="w-4 h-4" />
            {isScanningFile ? 'Scanning Image...' : 'Choose Image File'}
          </Button>
        </div>
      )}

      {/* Manual Input Mode */}
      {activeTab === 'manual' && (
        <form
          onSubmit={handleManualSubmit}
          className="bg-card border border-border/80 rounded-3xl p-5 space-y-4 shadow-sm"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-primary" />
              Manual Pass / Code Entry
            </h4>
            <p className="text-xs text-muted-foreground">
              Paste or type the customer QR token or store link.
            </p>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="e.g. user_123:store_456 or store-slug"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="h-12 rounded-xl text-xs font-mono"
              autoFocus
              required
            />
          </div>

          <Button
            type="submit"
            disabled={!manualCode.trim()}
            className="w-full h-11 rounded-xl text-xs font-bold gap-2"
          >
            <span>Apply Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>
      )}
    </div>
  );
}
