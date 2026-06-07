const nextConfig = {
  // Увеличиваем лимит тела запроса для загрузки фото (base64 = ~4/3 от размера файла)
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "serpapi.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.aliexpress.com" },
      { protocol: "https", hostname: "*.wildberries.ru" },
      { protocol: "https", hostname: "*.ozon.ru" },
    ],
  },
};

export default nextConfig;
