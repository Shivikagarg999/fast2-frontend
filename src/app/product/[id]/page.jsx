import ProductDetailClient from './ProductDetailClient';

const API_BASE = 'https://api.fast2.in/api';
const SITE_URL = 'https://www.gmkart.com';

async function fetchProduct(id) {
  try {
    const res = await fetch(`${API_BASE}/product/${id}`, {
      // Product data (price/stock) changes often — avoid serving a stale cached
      // page indefinitely, but still cache briefly to keep repeated crawls cheap.
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | GMKart',
      description: 'This product could not be found on GMKart.'
    };
  }

  const plainDescription = stripHtml(product.description);
  const description = plainDescription
    ? `${plainDescription.slice(0, 155)}${plainDescription.length > 155 ? '…' : ''}`
    : `Buy ${product.name} online on GMKart. Fast delivery, best prices.`;
  const title = `${product.name}${product.brand ? ` by ${product.brand}` : ''} | GMKart`;
  const imageUrl = product.images?.[0]?.url;
  const productPath = product.slug || id;
  const url = `${SITE_URL}/product/${productPath}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: product.name }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.description) || undefined,
    image: product.images?.map(img => img.url),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    sku: product._id,
    aggregateRating: product.ratings?.count
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.ratings.average || 4.5,
          reviewCount: product.ratings.count
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug || id}`,
      priceCurrency: 'INR',
      price: product.effectivePrice ?? product.price,
      availability: product.quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
