
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: false, // Keep optimization ON
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Example placeholder
        port: '',
        pathname: '/**',
      },
      { // Add placeholder domain
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      { // Add pollinations.ai for hero
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
       // Add other domains for static/sample images if needed
       {
        protocol: 'https',
        hostname: 'videos.openai.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tse1.mm.bing.net',
        port: '',
        pathname: '/**',
      },
      // Add Supabase storage domain if images will be stored there
      // Example: { protocol: 'https', hostname: 'your-supabase-project-id.supabase.co', port: '', pathname: '/storage/v1/object/public/**' }
    ],
  },
  env: {
     // Make API URL available client-side. Vercel automatically provides VERCEL_URL.
     // Fallback to a sensible default for local dev or if VERCEL_URL is not set.
     NEXT_PUBLIC_API_URL: process.env.VERCEL_URL
       ? `https://${process.env.VERCEL_URL}`
       : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Default for local dev

     NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'estrelas123', // Make admin password available client-side (use with caution)
  }
};

export default nextConfig;
