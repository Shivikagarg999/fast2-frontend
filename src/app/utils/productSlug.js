export const slugifyProductName = (value) => {
  const slug = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || '';
};

export const getProductSlug = (product) => {
  return slugifyProductName(product?.name) || product?.slug || product?._id || product?.id || '';
};

export const getProductPath = (product) => {
  return `/product/${getProductSlug(product)}`;
};
