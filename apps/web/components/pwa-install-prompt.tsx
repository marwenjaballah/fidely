'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait slightly before showing
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-background shadow-2xl rounded-2xl p-4 border border-border z-50 flex items-center justify-between animate-in slide-in-from-bottom-5">
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">Add to Home Screen</span>
        <span className="text-xs text-muted-foreground">Fast access, no download required.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleInstall} size="sm" className="rounded-full flex items-center gap-1">
          <Download size={16} /> Install
        </Button>
        <button onClick={() => setShowPrompt(false)} className="p-2 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
