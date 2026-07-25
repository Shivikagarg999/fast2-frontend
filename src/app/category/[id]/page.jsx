import CategoryProductsClient from './CategoryProductsClient';

const API_BASE = 'https://api.fast2.in/api';
const SITE_URL = 'https://www.gmkart.com';

async function fetchCategory(id) {
  try {
    const res = await fetch(`${API_BASE}/category/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching category for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const category = await fetchCategory(id);

  if (!category) {
    return {
      title: 'Category Not Found | GMKart',
      description: 'This category could not be found on GMKart.'
    };
  }

  const title = `${category.name} - Shop Online | GMKart`;
  const description = `Shop ${category.name} online on GMKart. Fresh products, best prices, fast delivery to your doorstep.`;
  const url = `${SITE_URL}/category/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: category.image ? [category.image] : undefined
    }
  };
}

export default function CategoryPage() {
  return <CategoryProductsClient />;
}
