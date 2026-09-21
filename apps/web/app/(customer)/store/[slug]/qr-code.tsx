'use client';

import { QRCodeSVG } from 'qrcode.react';

export function CustomerQRCode({ token }: { token: string }) {
  return (
    <div className="flex justify-center p-6 bg-white rounded-3xl shadow-sm border">
      <QRCodeSVG 
        value={token} 
        size={250}
        level="Q"
        includeMargin={true}
      />
    </div>
  );
}
