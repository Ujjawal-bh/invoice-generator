import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** PDFKit loads `.afm` metrics from disk — bundling breaks downloads at runtime. */
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
