const API_BASE = 'https://api.fast2.in/api';
const SITE_URL = 'https://www.gmkart.com';

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Sitemap fetch failed for ${url}:`, error);
    return null;
  }
}

async function getProductEntries() {
  const data = await safeFetchJson(`${API_BASE}/product?limit=5000`);
  const products = data?.products || [];
  return products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug || p._id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
}

async function getCategoryEntries() {
  const categories = await safeFetchJson(`${API_BASE}/category/getall`);
  if (!Array.isArray(categories)) return [];
  return categories.map((c) => ({
    url: `${SITE_URL}/category/${c._id}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}

async function getShopEntries() {
  const data = await safeFetchJson(`${API_BASE}/shops?limit=1000`);
  const shops = data?.data || [];
  return shops
    .filter((s) => s.shopSlug)
    .map((s) => ({
      url: `${SITE_URL}/shops/${s.shopSlug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
}

export default async function sitemap() {
  const staticEntries = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/shops`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/deliver`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/policies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-and-conditions`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/return-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cancellation-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const [products, categories, shops] = await Promise.all([
    getProductEntries(),
    getCategoryEntries(),
    getShopEntries(),
  ]);

  return [...staticEntries, ...categories, ...shops, ...products];
}
