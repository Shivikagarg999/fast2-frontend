export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/proxy/',
        '/pages/',
        '/login',
        '/verify',
        '/checkout',
        '/delete-account',
      ],
    },
    sitemap: 'https://www.gmkart.com/sitemap.xml',
  };
}
