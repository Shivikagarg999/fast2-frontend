import ShopDetailClient from './ShopDetailClient';

const API_BASE = 'https://api.fast2.in/api';
const SITE_URL = 'https://www.gmkart.com';

async function fetchShop(slug) {
  try {
    const res = await fetch(`${API_BASE}/shops/${slug}`, {
      next: { revalidate: 1800 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('Error fetching shop for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shop = await fetchShop(slug);

  if (!shop) {
    return {
      title: 'Shop Not Found | GMKart',
      description: 'This shop could not be found on GMKart.'
    };
  }

  const title = `${shop.shopName} | GMKart`;
  const description = shop.description
    ? shop.description.slice(0, 155)
    : `Shop from ${shop.shopName} on GMKart. Browse products, reviews, and more.`;
  const url = `${SITE_URL}/shops/${slug}`;
  const image = shop.coverImage?.url || shop.logo?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: shop.shopName }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined
    }
  };
}

export default function ShopDetailPage() {
  return <ShopDetailClient />;
}
