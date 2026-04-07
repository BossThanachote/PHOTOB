/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dyiqrplznebjlbaxpmqp.supabase.co',
      },
    ],
  },
};

export default nextConfig;