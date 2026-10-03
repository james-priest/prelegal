import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build a static site into out/, served by the FastAPI backend.
  output: "export",
  // Emit nda/index.html (not nda.html) so a plain static file server resolves /nda/.
  trailingSlash: true,
};

export default nextConfig;
