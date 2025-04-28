
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: false, // Keep optimization ON unless specific sources require it
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Placeholder domain
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai', // Domain for hero image source
        port: '',
        pathname: '/**',
      },
      // Add any other image domains used (e.g., Supabase Storage if applicable)
      // Example for Supabase:
      // {
      //   protocol: 'https',
      //   // Replace with your actual Supabase project hostname
      //   hostname: 'your-project-ref.supabase.co',
      //   port: '',
      //   pathname: '/storage/v1/object/public/**',
      // },
      // Example domains from previous state (keep if still needed)
       {
        protocol: 'https',
        hostname: 'videos.openai.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tse*.mm.bing.net', // Use wildcard for TSE domains
        port: '',
        pathname: '/**',
      },

    ],
  },
  env: {
     // Use environment variables for Vercel deployment
     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
     NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
     // Ensure the admin password is also available if needed client-side (less secure)
     // If only used server-side (API routes), use ADMIN_PASSWORD directly in Vercel env vars
     NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD, // Keep if login check is client-side
  }
};

export default nextConfig;
