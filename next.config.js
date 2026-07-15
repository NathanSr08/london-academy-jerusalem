/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained server bundle for a small production Docker image.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Mongoose is a server-only dependency; keep it out of the client bundle.
    serverComponentsExternalPackages: ["mongoose", "bcryptjs", "nodemailer"],
  },
};

module.exports = nextConfig;
