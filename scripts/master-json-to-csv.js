const fs = require('fs');
const path = require('path');

// Converts data/master-food-products.json into two CSVs whose headers match
// the GMkart-backend bulk-upload endpoints exactly:
//   - data/master-categories.csv -> POST /api/category/upload/csv      (GMkart-admin: Categories > Upload CSV)
//   - data/master-products.csv   -> POST /api/admin/products/upload/csv (GMkart-admin: Products > Upload CSV)
//
// Upload order matters: import categories first so the product importer's
// Category column matches an existing category (with the correct HSN/GST
// already set) instead of falling back to a bare auto-created one.
//
// IMPORTANT - fields left blank by this script become real defaults on
// import, not "still need to fill in" placeholders:
//   - Products: blank Price -> imports as price 0. Fill in Price (and
//     ideally Seller/Warehouse) before uploading, or the listing is unusable.
//   - Both: blank GST Percent/HSN Code -> imports as 0%/blank. These were
//     deliberately left for finance/compliance to verify - do not assume 0%
//     is correct.
//   - Both: the backend now force-sets isActive to false for any row with no
//     image, regardless of the Active Status column. Every row here has no
//     image, so everything imports as Inactive until you add Image URL /
//     Image 1-5 (or edit each one in the admin) - this is intentional, not a bug.
//
// Re-run after editing scripts/generate-master-food-products.js + its JSON output:
//   node scripts/generate-master-food-products.js
//   node scripts/master-json-to-csv.js

function csvField(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvField).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvField).join(','));
  }
  return lines.join('\n');
}

function buildCategoriesCsv(categories) {
  const headers = [
    'Category ID', 'Category Name', 'HSN Code', 'GST Percent', 'Tax Type',
    'Default UOM', 'Sort Order', 'Active Status', 'Image URL',
  ];
  // Category ID is left blank: these are new categories to create, not edits
  // to existing ones. Fill it in only when re-uploading an exported/edited
  // categories CSV to bulk-edit existing categories instead of creating new ones.
  const rows = categories.map((c) => [
    '',
    c.name,
    c.hsnCode || '',
    c.gstPercent ?? '',
    c.taxType || 'inclusive',
    c.defaultUOM || 'piece',
    c.sortOrder ?? 0,
    c.isActive ? 'Active' : 'Inactive',
    c.image || '',
  ]);
  return toCsv(headers, rows);
}

function buildProductsCsv(products, categorySlugToName) {
  const headers = [
    'Product Name', 'Description', 'Brand', 'Category', 'Price', 'Old Price',
    'Discount Percentage', 'HSN Code', 'GST Percent', 'Tax Type', 'Unit', 'Unit Value',
    'Promotor ID', 'Promotor Commission Rate', 'Promotor Commission Type', 'Promotor Commission Amount',
    'Quantity', 'Stock Status', 'Active Status', 'Low Stock Threshold',
    'Min Order Quantity', 'Max Order Quantity', 'Weight', 'Weight Unit', 'SKU',
    'Seller', 'Warehouse', 'Storage Type', 'Estimated Delivery Time',
    'Delivery Charges', 'Free Delivery Threshold', 'Serviceable Pincodes',
    'Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Video',
  ];
  const rows = products.map((p) => [
    p.name,
    p.description || '',
    p.brand || '',
    categorySlugToName.get(p.category) || p.category,
    p.price ?? '',
    p.oldPrice ?? '',
    p.discountPercentage ?? 0,
    p.hsnCode || '',
    p.gstPercent ?? '',
    p.taxType || 'inclusive',
    p.unit || '',
    p.unitValue ?? '',
    '', '', '', '', // Promotor ID / Commission Rate / Type / Amount - not used for master data
    p.quantity ?? '',
    p.stockStatus || 'out-of-stock',
    p.isActive ? 'Active' : 'Inactive',
    p.lowStockThreshold ?? 10,
    p.minOrderQuantity ?? 1,
    p.maxOrderQuantity ?? 10,
    p.weight ?? '',
    p.weightUnit || '',
    '', // SKU
    '', // Seller
    '', // Warehouse
    '', // Storage Type
    '', // Estimated Delivery Time
    '', // Delivery Charges
    '', // Free Delivery Threshold
    (p.serviceablePincodes || []).join(';'),
    ...[0, 1, 2, 3, 4].map((idx) => (p.images && p.images[idx] && p.images[idx].url) || ''),
    '', // Video
  ]);
  return toCsv(headers, rows);
}

function convert() {
  const jsonPath = path.join(__dirname, '..', 'data', 'master-food-products.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const categorySlugToName = new Map(data.categories.map((c) => [c.slug, c.name]));

  const categoriesCsv = buildCategoriesCsv(data.categories);
  const productsCsv = buildProductsCsv(data.products, categorySlugToName);

  const outDir = path.join(__dirname, '..', 'data');
  fs.writeFileSync(path.join(outDir, 'master-categories.csv'), categoriesCsv);
  fs.writeFileSync(path.join(outDir, 'master-products.csv'), productsCsv);

  console.log(`Wrote data/master-categories.csv (${data.categories.length} rows)`);
  console.log(`Wrote data/master-products.csv (${data.products.length} rows)`);
  console.log('Reminder: fill in Price on every product row (and verify GST/HSN) before uploading - blank Price imports as 0.');
  console.log('Reminder: every row has no image, so it will import as Inactive regardless of the Active Status column - add an image to activate it.');
}

convert();
