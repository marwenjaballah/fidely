'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      try {
        const hasCamera = await Html5Qrcode.getCameras();
        if (hasCamera && hasCamera.length > 0) {
          if (isMounted) setHasPermission(true);
          
          if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(containerId, {
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
              verbose: false
            });
            await scannerRef.current.start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              (decodedText) => {
                if (isMounted) {
                  onScanSuccess(decodedText);
                  // Optionally pause scanner here to prevent multiple scans
                  scannerRef.current?.pause(true);
                  setTimeout(() => scannerRef.current?.resume(), 2000);
                }
              },
              (errorMessage) => {
                if (onScanError && isMounted) {
                  onScanError(errorMessage);
                }
              }
            );
          }
        } else {
          if (isMounted) setHasPermission(false);
        }
      } catch (err) {
        console.error('Failed to initialize scanner:', err);
        if (isMounted) setHasPermission(false);
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 rounded-2xl text-slate-500">
        Camera access denied or not available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-3xl shadow-lg border-2 border-slate-200">
      <div id={containerId} className="w-full bg-black"></div>
    </div>
  );
}
