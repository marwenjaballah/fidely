import { MetadataRoute } from 'next';
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    short_name: BRAND_NAME,
    description: 'Your digital loyalty card and rewards platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: BRAND_LOGO_SRC,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
