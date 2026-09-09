'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';

export type FeedbackState = 'idle' | 'success' | 'error';

interface FeedbackOverlayProps {
  state: FeedbackState;
  message?: string;
  onDismiss: () => void;
}

export function FeedbackOverlay({ state, message, onDismiss }: FeedbackOverlayProps) {
  useEffect(() => {
    if (state !== 'idle') {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, onDismiss]);

  if (state === 'idle') return null;

  const isSuccess = state === 'success';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 ${isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {isSuccess ? (
        <CheckCircle size={120} className="mb-6 animate-in zoom-in duration-300 delay-150" />
      ) : (
        <XCircle size={120} className="mb-6 animate-in zoom-in duration-300 delay-150" />
      )}
      <h2 className="text-4xl font-bold text-center">
        {isSuccess ? 'Success!' : 'Error'}
      </h2>
      {message && <p className="text-xl mt-4 text-center opacity-90">{message}</p>}
    </div>
  );
}
