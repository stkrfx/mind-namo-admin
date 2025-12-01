/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // For Google Profile Pictures
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // For UploadThing hosted images
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Fallback if you switch auth later, but good to have
        pathname: "**",
      },
    ],
  },
  // We want to minimize build errors from non-critical linting during rapid iteration
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;