import { MetadataRoute } from 'next';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    short_name: BRAND_NAME,
    description: 'Digital loyalty cards, rewards, and handheld cashier POS system',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#09090b',
    theme_color: '#09090b',
    categories: ['business', 'shopping', 'finance'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: 'Customer Wallet',
        short_name: 'Wallet',
        description: 'View digital passes and redeem rewards',
        url: '/customer/overview',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Cashier POS',
        short_name: 'Register',
        description: 'Scan customer passes and award points',
        url: '/cashier',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Merchant Dashboard',
        short_name: 'Merchant',
        description: 'Manage store, staff, and customer activity',
        url: '/merchant/overview',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
