import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve metadata into the initial head for search, social previews and
  // ordinary browsers. Do not leave canonical/description tags in streamed body content.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
