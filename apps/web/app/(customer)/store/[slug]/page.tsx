import { CustomerQRCode } from './qr-code';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export default function CustomerStorePage({ params }: { params: { slug: string } }) {
  // In a real app, you would fetch store details and customer membership using the slug.
  const storeName = params.slug === 'test-shop' ? 'Test Coffee Shop' : params.slug;
  const points = 1250;
  const token = 'sample-qr-token-12345';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-md mt-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">{storeName}</h1>
          <p className="text-slate-500 mt-2">Digital Loyalty Card</p>
        </div>

        <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          
          <h2 className="text-6xl font-black">{points}</h2>
          <p className="text-primary-foreground/80 font-medium uppercase tracking-widest mt-2 text-sm">Total Points</p>
        </div>

        <div className="mt-8 flex justify-center">
          <CustomerQRCode token={token} />
        </div>
        <p className="text-center text-sm text-slate-400 mt-4">Present this code at checkout</p>

      </div>
      
      <PWAInstallPrompt />
    </div>
  );
}
