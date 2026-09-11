import SubcategoryProductsClient from './SubcategoryProductsClient';

const API_BASE = 'https://api.gmkart.com/api';
const SITE_URL = 'https://www.gmkart.com';

async function fetchSubcategory(id) {
  try {
    const res = await fetch(`${API_BASE}/subcategory/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching subcategory for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const subcategory = await fetchSubcategory(id);

  if (!subcategory) {
    return {
      title: 'Subcategory Not Found | GMKart',
      description: 'This subcategory could not be found on GMKart.'
    };
  }

  const title = `${subcategory.name} - Shop Online | GMKart`;
  const description = `Shop ${subcategory.name} online on GMKart. Fresh products, best prices, fast delivery to your doorstep.`;
  const url = `${SITE_URL}/subcategory/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: subcategory.image ? [{ url: subcategory.image, alt: subcategory.name }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: subcategory.image ? [subcategory.image] : undefined
    }
  };
}

export default function SubcategoryPage() {
  return <SubcategoryProductsClient />;
}
