
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: false, // Ensure optimization is generally ON
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Add Firebase Storage domain (if still needed for other images)
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      { // Add via.placeholder.com for sample news images
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      { // Added Unsplash for hero background (pollinations.ai is used now)
        protocol: 'https',
        hostname: 'images.unsplash.com', // Keep if needed, otherwise remove
        port: '',
        pathname: '/**',
      },
       { // Added pollinations.ai for hero background
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
       { // Added sample image domains for Apresentacao/Locais
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
    ],
  },
  env: {
     // Make API URL available client-side if needed (e.g., for direct calls outside getStaticProps/getServerSideProps)
     // Ensure this doesn't expose sensitive keys
     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://estrelas-backend.onrender.com',
     NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'estrelas123', // Make admin password available for client-side checks (use with caution)
  }
};

export default nextConfig;

    