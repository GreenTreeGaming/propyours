import type {
  NextConfig,
} from "next";

const securityHeaders = [
  {
    key:
        "X-Content-Type-Options",
    value:
        "nosniff",
  },

  {
    key:
        "X-Frame-Options",
    value:
        "DENY",
  },

  {
    key:
        "Referrer-Policy",
    value:
        "strict-origin-when-cross-origin",
  },

  {
    key:
        "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payments=()",
      "usb=()",
    ].join(", "),
  },

  {
    key:
        "Cross-Origin-Opener-Policy",
    value:
        "same-origin",
  },

  {
    key:
        "X-DNS-Prefetch-Control",
    value:
        "on",
  },
];

if (
    process.env.NODE_ENV ===
    "production"
) {
  securityHeaders.push({
    key:
        "Strict-Transport-Security",
    value:
        "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig:
    NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol:
            "https",
        hostname:
            "images.unsplash.com",
      },
      {
        protocol:
            "https",
        hostname:
            "upload.wikimedia.org",
      },
      {
        protocol:
            "https",
        hostname:
            "tvs-emerald.com",
      },
      {
        protocol:
            "https",
        hostname:
            "i.pravatar.cc",
      },
      {
        protocol:
            "https",
        hostname:
            "utfs.io",
      },
      {
        protocol:
            "https",
        hostname:
            "ufs.sh",
      },
      {
        protocol:
            "https",
        hostname:
            "*.ufs.sh",
      },
    ],
  },

  async headers() {
    return [
      {
        source:
            "/:path*",

        headers:
        securityHeaders,
      },
    ];
  },
};

export default nextConfig;