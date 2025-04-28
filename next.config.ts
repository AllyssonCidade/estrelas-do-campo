
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
     // Make API URL available client-side. Vercel automatically provides VERCEL_URL
     // which points to the frontend deployment URL. We need the *backend* URL.
     // Set NEXT_PUBLIC_API_URL in Vercel Environment Variables for the frontend.
     // This env var should point to the backend deployment URL (e.g., your Vercel backend function URL or Render URL).
     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

     // Make admin password available client-side for the login check.
     // Set ADMIN_PASSWORD in Vercel Environment Variables. Use NEXT_PUBLIC_ prefix
     // if the check truly needs to happen client-side (less secure).
     // If check happens server-side (e.g., in API routes), just ADMIN_PASSWORD is fine.
     // For this setup where login happens client-side:
     NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD, // Renamed from ADMIN_PASSWORD to NEXT_PUBLIC_ADMIN_PASSWORD for clarity
  }
};

export default nextConfig;
