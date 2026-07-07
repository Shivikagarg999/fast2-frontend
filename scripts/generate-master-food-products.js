const fs = require('fs');
const path = require('path');

// Master data source for food categories & products.
// Field names mirror GMkart-backend/models/product.js and models/category.js
// so this can be mapped/imported with minimal changes.
//
// Edit the arrays below to add/remove items, then re-run:
//   node scripts/generate-master-food-products.js
// Output: data/master-food-products.json
//
// `slug` (on categories) and `category` (on products, holding that slug),
// plus `subCategory` and `tags`, are NOT part of the Product/Category
// Mongoose schemas - they only exist to let this dataset link products to
// categories and stay searchable. Mongoose will silently drop them on save
// (strict mode) unless the schema is extended to include them.

// Required by the schema but intentionally left for the seller/admin to set per listing.
const REQUIRED_FIELDS_TO_FILL = ['category (map slug -> real Category _id)', 'price'];
// Optional schema fields worth reviewing/customizing before going live.
const OPTIONAL_FIELDS_TO_REVIEW = ['oldPrice', 'seller', 'shop', 'quantity', 'stockStatus', 'images', 'variants'];
// Tax fields deliberately left null - guessing HSN/GST wrong is a compliance risk; verify with finance.
const COMPLIANCE_FIELDS_TO_VERIFY = ['hsnCode', 'gstPercent'];

const CATEGORIES = [
  { slug: 'atta-rice-dal', name: 'Atta, Rice & Dal', description: 'Staple flours, rice varieties and pulses for everyday cooking.', defaultUOM: 'kg' },
  { slug: 'edible-oils-ghee', name: 'Edible Oils & Ghee', description: 'Cooking oils and ghee for daily and festive cooking.', defaultUOM: 'l' },
  { slug: 'masalas-spices', name: 'Masalas & Spices', description: 'Whole and powdered spices, blended masalas and salt.', defaultUOM: 'g' },
  { slug: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs', description: 'Milk, curd, paneer, cheese, bread and eggs.', defaultUOM: 'piece' },
  { slug: 'fruits-vegetables', name: 'Fruits & Vegetables', description: 'Fresh seasonal fruits and vegetables.', defaultUOM: 'kg' },
  { slug: 'bakery-biscuits', name: 'Bakery, Biscuits & Cookies', description: 'Biscuits, cookies, bread loaves and bakery items.', defaultUOM: 'g' },
  { slug: 'breakfast-sauces-spreads', name: 'Breakfast, Sauces & Spreads', description: 'Cereals, jams, ketchups, spreads and breakfast essentials.', defaultUOM: 'g' },
  { slug: 'noodles-pasta-ready-to-cook', name: 'Noodles, Pasta & Ready-to-Cook', description: 'Instant noodles, pasta and ready-to-eat/cook meals.', defaultUOM: 'g' },
  { slug: 'snacks-namkeen', name: 'Snacks & Namkeen', description: 'Chips, namkeen and packaged snacks.', defaultUOM: 'g' },
  { slug: 'chocolates-sweets', name: 'Chocolates & Sweets', description: 'Chocolates, candies and traditional Indian sweets.', defaultUOM: 'g' },
  { slug: 'tea-coffee-health-drinks', name: 'Tea, Coffee & Health Drinks', description: 'Tea, coffee and malt-based health drinks.', defaultUOM: 'g' },
  { slug: 'cold-drinks-juices-water', name: 'Cold Drinks, Juices & Water', description: 'Soft drinks, juices, energy drinks and packaged water.', defaultUOM: 'ml' },
  { slug: 'frozen-food-ice-cream', name: 'Frozen Food & Ice Cream', description: 'Frozen snacks, vegetables, parathas and ice creams.', defaultUOM: 'g' },
];

const CATEGORY_DESCRIPTION_FILLER = {
  'atta-rice-dal': 'a kitchen staple for everyday Indian cooking',
  'edible-oils-ghee': 'a kitchen essential for daily cooking and tempering',
  'masalas-spices': 'a flavour essential for authentic Indian dishes',
  'dairy-bread-eggs': 'a fresh dairy & bakery essential for daily use',
  'fruits-vegetables': 'a fresh pick for healthy daily meals',
  'bakery-biscuits': 'a popular tea-time snack',
  'breakfast-sauces-spreads': 'a quick breakfast and meal-time essential',
  'noodles-pasta-ready-to-cook': 'a quick and convenient meal option',
  'snacks-namkeen': 'a popular snack for munching anytime',
  'chocolates-sweets': 'a sweet treat loved by all ages',
  'tea-coffee-health-drinks': 'a comforting daily beverage',
  'cold-drinks-juices-water': 'a refreshing drink for any time of day',
  'frozen-food-ice-cream': 'a convenient frozen favourite',
};

// [brand, name, subCategory, weight, weightUnit]
const PRODUCTS_BY_CATEGORY = {
  'atta-rice-dal': [
    ['Aashirvaad', 'Aashirvaad Shudh Chakki Atta', 'Atta & Flour', 5, 'kg'],
    ['Aashirvaad', 'Aashirvaad Multigrain Atta', 'Atta & Flour', 5, 'kg'],
    ['Aashirvaad', 'Aashirvaad Select Sharbati Atta', 'Atta & Flour', 5, 'kg'],
    ['Pillsbury', 'Pillsbury Chakki Fresh Atta', 'Atta & Flour', 5, 'kg'],
    ['Patanjali', 'Patanjali Whole Wheat Atta', 'Atta & Flour', 5, 'kg'],
    ['Fortune', 'Fortune Chakki Fresh Atta', 'Atta & Flour', 5, 'kg'],
    ['Annapurna', 'Annapurna Whole Wheat Atta', 'Atta & Flour', 5, 'kg'],
    ['India Gate', 'India Gate Basmati Rice Classic', 'Rice', 5, 'kg'],
    ['India Gate', 'India Gate Basmati Rice Dubar', 'Rice', 1, 'kg'],
    ['Daawat', 'Daawat Rozana Basmati Rice', 'Rice', 5, 'kg'],
    ['Daawat', 'Daawat Rozana Gold Basmati Rice', 'Rice', 5, 'kg'],
    ['Kohinoor', 'Kohinoor Charminar Basmati Rice', 'Rice', 1, 'kg'],
    ['Fortune', 'Fortune Everyday Basmati Rice', 'Rice', 1, 'kg'],
    ['Patanjali', 'Patanjali Sonamasoori Rice', 'Rice', 5, 'kg'],
    ['India Gate', 'India Gate Mogra Rice', 'Rice', 5, 'kg'],
    ['Tata Sampann', 'Tata Sampann Toor Dal', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Chana Dal', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Moong Dal', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Masoor Dal', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Urad Dal Gota', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Rajma', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Kabuli Chana', 'Dal & Pulses', 1, 'kg'],
    ['Organic Tattva', 'Organic Tattva Toor Dal', 'Dal & Pulses', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Besan', 'Flour & Sooji', 1, 'kg'],
    ['MTR', 'MTR Rava Sooji', 'Flour & Sooji', 1, 'kg'],
    ['Tata Sampann', 'Tata Sampann Poha', 'Flour & Sooji', 500, 'g'],
    ['Patanjali', 'Patanjali Besan', 'Flour & Sooji', 1, 'kg'],
  ],
  'edible-oils-ghee': [
    ['Fortune', 'Fortune Sunlite Refined Sunflower Oil', 'Cooking Oil', 1, 'l'],
    ['Saffola', 'Saffola Gold Edible Oil', 'Cooking Oil', 1, 'l'],
    ['Fortune', 'Fortune Soyabean Oil', 'Cooking Oil', 1, 'l'],
    ['Dhara', 'Dhara Mustard Oil', 'Cooking Oil', 1, 'l'],
    ['Fortune', 'Fortune Kachi Ghani Mustard Oil', 'Cooking Oil', 1, 'l'],
    ['Patanjali', 'Patanjali Mustard Oil', 'Cooking Oil', 1, 'l'],
    ['Gemini', 'Gemini Groundnut Oil', 'Cooking Oil', 1, 'l'],
    ['Saffola', 'Saffola Tasty Refined Oil', 'Cooking Oil', 1, 'l'],
    ['Sundrop', 'Sundrop Superlite Advanced Oil', 'Cooking Oil', 1, 'l'],
    ['Parachute', 'Parachute Coconut Oil', 'Cooking Oil', 500, 'ml'],
    ['Idhayam', 'Idhayam Gingelly Sesame Oil', 'Cooking Oil', 500, 'ml'],
    ['Figaro', 'Figaro Olive Oil', 'Cooking Oil', 500, 'ml'],
    ['Borges', 'Borges Extra Virgin Olive Oil', 'Cooking Oil', 500, 'ml'],
    ['Fortune', 'Fortune Rice Bran Health Oil', 'Cooking Oil', 1, 'l'],
    ['Amul', 'Amul Cow Ghee', 'Ghee', 1, 'l'],
    ['Patanjali', 'Patanjali Cow Ghee', 'Ghee', 1, 'l'],
    ['Mother Dairy', 'Mother Dairy Pure Ghee', 'Ghee', 1, 'l'],
    ['Aashirvaad', 'Aashirvaad Svasti Ghee', 'Ghee', 1, 'l'],
    ['Dabur', 'Dabur Pure Cow Ghee', 'Ghee', 1, 'l'],
    ['Nandini', 'Nandini Pure Ghee', 'Ghee', 500, 'ml'],
  ],
  'masalas-spices': [
    ['MDH', 'MDH Deggi Mirch', 'Spice Powder', 100, 'g'],
    ['MDH', 'MDH Chana Masala', 'Blended Masala', 100, 'g'],
    ['MDH', 'MDH Pav Bhaji Masala', 'Blended Masala', 100, 'g'],
    ['MDH', 'MDH Kitchen King Masala', 'Blended Masala', 100, 'g'],
    ['MDH', 'MDH Meat Masala', 'Blended Masala', 100, 'g'],
    ['MDH', 'MDH Rajma Masala', 'Blended Masala', 100, 'g'],
    ['Everest', 'Everest Garam Masala', 'Blended Masala', 100, 'g'],
    ['Everest', 'Everest Kitchen King Masala', 'Blended Masala', 100, 'g'],
    ['Everest', 'Everest Sabzi Masala', 'Blended Masala', 100, 'g'],
    ['Everest', 'Everest Chicken Masala', 'Blended Masala', 100, 'g'],
    ['Everest', 'Everest Pav Bhaji Masala', 'Blended Masala', 100, 'g'],
    ['Everest', 'Everest Tea Masala', 'Blended Masala', 50, 'g'],
    ['Catch', 'Catch Turmeric Powder', 'Spice Powder', 200, 'g'],
    ['Catch', 'Catch Red Chilli Powder', 'Spice Powder', 200, 'g'],
    ['Catch', 'Catch Coriander Powder', 'Spice Powder', 200, 'g'],
    ['Catch', 'Catch Cumin Jeera Powder', 'Spice Powder', 100, 'g'],
    ['Catch', 'Catch Black Pepper Powder', 'Spice Powder', 100, 'g'],
    ['Catch', 'Catch Whole Cumin Seeds', 'Whole Spice', 200, 'g'],
    ['Catch', 'Catch Hing Asafoetida', 'Whole Spice', 25, 'g'],
    ['Badshah', 'Badshah Biryani Masala', 'Blended Masala', 100, 'g'],
    ['Suhana', 'Suhana Biryani Masala', 'Blended Masala', 100, 'g'],
    ['Eastern', 'Eastern Garam Masala', 'Blended Masala', 100, 'g'],
    ['National', 'National Garam Masala', 'Blended Masala', 100, 'g'],
    ['Tata', 'Tata Salt', 'Salt', 1, 'kg'],
    ['Tata', 'Tata Salt Lite', 'Salt', 1, 'kg'],
    ['Aashirvaad', 'Aashirvaad Iodised Salt', 'Salt', 1, 'kg'],
  ],
  'dairy-bread-eggs': [
    ['Amul', 'Amul Gold Full Cream Milk', 'Milk', 1, 'l'],
    ['Amul', 'Amul Taaza Toned Milk', 'Milk', 1, 'l'],
    ['Mother Dairy', 'Mother Dairy Full Cream Milk', 'Milk', 1, 'l'],
    ['Nestle', 'Nestle a+ Toned Milk', 'Milk', 1, 'l'],
    ['Amul', 'Amul Masti Curd', 'Curd', 400, 'g'],
    ['Mother Dairy', 'Mother Dairy Curd', 'Curd', 400, 'g'],
    ['Epigamia', 'Epigamia Greek Yogurt', 'Curd', 90, 'g'],
    ['Amul', 'Amul Butter', 'Butter', 500, 'g'],
    ['Amul', 'Amul Lite Butter', 'Butter', 100, 'g'],
    ['Britannia', 'Britannia Cheese Slices', 'Cheese', 200, 'g'],
    ['Amul', 'Amul Cheese Block', 'Cheese', 200, 'g'],
    ['Go', 'Go Cheese Slices', 'Cheese', 200, 'g'],
    ['Amul', 'Amul Paneer', 'Paneer', 200, 'g'],
    ['Mother Dairy', 'Mother Dairy Paneer', 'Paneer', 200, 'g'],
    ['Nestle', 'Nestle Milkmaid Condensed Milk', 'Milk', 400, 'g'],
    ['Amul', 'Amul Fresh Cream', 'Cream', 200, 'ml'],
    ['Britannia', 'Britannia White Bread', 'Bread', 400, 'g'],
    ['Britannia', 'Britannia 100% Whole Wheat Bread', 'Bread', 400, 'g'],
    ['Britannia', 'Britannia Brown Bread', 'Bread', 400, 'g'],
    ['Modern', 'Modern White Bread', 'Bread', 400, 'g'],
    ['Modern', 'Modern Pav Buns', 'Bread', 6, 'piece'],
    ['Farm Fresh', 'Farm Fresh White Eggs', 'Eggs', 6, 'piece'],
    ['Farm Fresh', 'Farm Fresh Brown Eggs', 'Eggs', 6, 'piece'],
    ['Farm Fresh', 'Farm Fresh White Eggs Tray', 'Eggs', 12, 'piece'],
    ['Amul', 'Amul Buttermilk Chaas', 'Buttermilk', 200, 'ml'],
    ['Amul', 'Amul Lassi', 'Lassi', 200, 'ml'],
    ['Britannia', 'Britannia Cheese Spread', 'Cheese', 180, 'g'],
  ],
  'fruits-vegetables': [
    ['Fresh', 'Fresh Banana', 'Fruits', 1, 'kg'],
    ['Fresh', 'Fresh Apple Shimla', 'Fruits', 1, 'kg'],
    ['Fresh', 'Fresh Mango Alphonso', 'Fruits', 1, 'kg'],
    ['Fresh', 'Fresh Papaya', 'Fruits', 1, 'piece'],
    ['Fresh', 'Fresh Pomegranate', 'Fruits', 1, 'kg'],
    ['Fresh', 'Fresh Watermelon', 'Fruits', 1, 'piece'],
    ['Fresh', 'Fresh Orange', 'Fruits', 1, 'kg'],
    ['Fresh', 'Fresh Grapes Green', 'Fruits', 500, 'g'],
    ['Fresh', 'Fresh Guava', 'Fruits', 1, 'kg'],
    ['Fresh', 'Fresh Pineapple', 'Fruits', 1, 'piece'],
    ['Fresh', 'Fresh Onion', 'Vegetables', 1, 'kg'],
    ['Fresh', 'Fresh Potato', 'Vegetables', 1, 'kg'],
    ['Fresh', 'Fresh Tomato', 'Vegetables', 1, 'kg'],
    ['Fresh', 'Fresh Green Capsicum', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Cucumber', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Carrot', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Cauliflower', 'Vegetables', 1, 'piece'],
    ['Fresh', 'Fresh Cabbage', 'Vegetables', 1, 'piece'],
    ['Fresh', 'Fresh Spinach Palak', 'Vegetables', 250, 'g'],
    ['Fresh', 'Fresh Coriander Leaves', 'Vegetables', 100, 'g'],
    ['Fresh', 'Fresh Green Chilli', 'Vegetables', 100, 'g'],
    ['Fresh', 'Fresh Ginger', 'Vegetables', 200, 'g'],
    ['Fresh', 'Fresh Garlic', 'Vegetables', 200, 'g'],
    ['Fresh', 'Fresh Lemon', 'Vegetables', 250, 'g'],
    ['Fresh', 'Fresh Brinjal', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Bottle Gourd Lauki', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Okra Bhindi', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Green Peas', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Beetroot', 'Vegetables', 500, 'g'],
    ['Fresh', 'Fresh Sweet Corn', 'Vegetables', 500, 'g'],
  ],
  'bakery-biscuits': [
    ['Britannia', 'Britannia Good Day Butter Cookies', 'Cookies', 200, 'g'],
    ['Parle', 'Parle-G Original Glucose Biscuits', 'Glucose Biscuits', 200, 'g'],
    ['Britannia', 'Britannia Marie Gold', 'Marie Biscuits', 200, 'g'],
    ['Sunfeast', 'Sunfeast Dark Fantasy Choco Fills', 'Cream Biscuits', 100, 'g'],
    ['Britannia', 'Britannia Bourbon', 'Cream Biscuits', 150, 'g'],
    ['Oreo', 'Oreo Original Chocolate Biscuits', 'Cream Biscuits', 120, 'g'],
    ['Parle', 'Hide & Seek Chocolate Chip Cookies', 'Cookies', 200, 'g'],
    ['McVities', 'McVities Digestive Biscuits', 'Digestive Biscuits', 250, 'g'],
    ['Parle', 'Parle Monaco Salted Crackers', 'Crackers', 200, 'g'],
    ['Britannia', 'Britannia 50-50 Maska Chaska', 'Crackers', 150, 'g'],
    ['Sunfeast', "Sunfeast Mom's Magic Cashew Almond", 'Cookies', 200, 'g'],
    ['Patanjali', 'Patanjali Doodh Biscuits', 'Glucose Biscuits', 200, 'g'],
    ['Britannia', 'Britannia Nutrichoice Digestive', 'Digestive Biscuits', 200, 'g'],
    ['Parle', 'Parle Hide & Seek Fab', 'Cream Biscuits', 100, 'g'],
    ['Unibic', 'Unibic Choco Chip Cookies', 'Cookies', 150, 'g'],
    ['Britannia', 'Britannia Cake Rusk', 'Rusk', 200, 'g'],
    ['English Oven', 'English Oven Bread Loaf', 'Bread', 400, 'g'],
    ['Karachi Bakery', 'Karachi Bakery Fruit Biscuits', 'Cookies', 400, 'g'],
    ['Britannia', 'Britannia Treat Jim Jam', 'Cream Biscuits', 150, 'g'],
    ['Sunfeast', 'Sunfeast Marie Light', 'Marie Biscuits', 200, 'g'],
  ],
  'breakfast-sauces-spreads': [
    ["Kellogg's", "Kellogg's Corn Flakes Original", 'Cereal', 475, 'g'],
    ["Kellogg's", "Kellogg's Chocos", 'Cereal', 700, 'g'],
    ['Quaker', 'Quaker Oats', 'Cereal', 1, 'kg'],
    ['Saffola', 'Saffola Oats Masala', 'Cereal', 400, 'g'],
    ["Bagrry's", "Bagrry's Crunchy Muesli", 'Cereal', 400, 'g'],
    ['Kissan', 'Kissan Mixed Fruit Jam', 'Jam', 500, 'g'],
    ['Kissan', 'Kissan Tomato Ketchup', 'Ketchup', 1, 'kg'],
    ['Maggi', 'Maggi Tomato Ketchup', 'Ketchup', 1, 'kg'],
    ['Heinz', 'Heinz Tomato Ketchup', 'Ketchup', 900, 'g'],
    ['Funfoods', 'Funfoods Veg Mayonnaise', 'Spread', 875, 'g'],
    ['Nutella', 'Nutella Hazelnut Spread', 'Spread', 350, 'g'],
    ['Dabur', 'Dabur Honey', 'Spread', 500, 'g'],
    ['Patanjali', 'Patanjali Honey', 'Spread', 500, 'g'],
    ['Pintola', 'Pintola Crunchy Peanut Butter', 'Spread', 1, 'kg'],
    ['Weikfield', 'Weikfield Custard Powder', 'Dessert Mix', 100, 'g'],
    ['Kissan', 'Kissan Fresh Tomato Puree', 'Sauce', 200, 'g'],
    ['Maggi', 'Maggi Hot & Sweet Sauce', 'Sauce', 1, 'kg'],
    ["Ching's", "Ching's Schezwan Chutney", 'Sauce', 250, 'g'],
  ],
  'noodles-pasta-ready-to-cook': [
    ['Maggi', 'Maggi 2-Minute Masala Noodles', 'Instant Noodles', 70, 'g'],
    ['Maggi', 'Maggi 2-Minute Masala Noodles Family Pack', 'Instant Noodles', 420, 'g'],
    ['Top Ramen', 'Top Ramen Masala Noodles', 'Instant Noodles', 70, 'g'],
    ['Knorr', 'Knorr Soupy Noodles', 'Instant Noodles', 60, 'g'],
    ['Yippee', 'Yippee Magic Masala Noodles', 'Instant Noodles', 70, 'g'],
    ['Maggi', 'Maggi Cuppa Mania Masala', 'Instant Noodles', 70, 'g'],
    ['Sunfeast', 'Sunfeast Pasta Treat Masala', 'Instant Pasta', 70, 'g'],
    ['Maggi', 'Maggi Atta Noodles', 'Instant Noodles', 72, 'g'],
    ['Knorr', 'Knorr Chinese Bhuna Masala Noodles', 'Instant Noodles', 60, 'g'],
    ['Bambino', 'Bambino Vermicelli Semiya', 'Vermicelli', 900, 'g'],
    ['MTR', 'MTR Roasted Vermicelli', 'Vermicelli', 900, 'g'],
    ['Borges', 'Borges Penne Pasta', 'Pasta', 500, 'g'],
    ['Del Monte', 'Del Monte Macaroni Pasta', 'Pasta', 500, 'g'],
    ['MTR', 'MTR Ready to Eat Poha', 'Ready to Eat', 180, 'g'],
    ["Haldiram's", "Haldiram's Ready to Eat Rajma", 'Ready to Eat', 285, 'g'],
    ['MTR', 'MTR Ready to Eat Dal Makhani', 'Ready to Eat', 300, 'g'],
    ['Gits', 'Gits Ready to Eat Gulab Jamun', 'Ready to Eat', 200, 'g'],
    ['Kohinoor', 'Kohinoor Ready to Eat Biryani', 'Ready to Eat', 250, 'g'],
    ['MTR', 'MTR Rava Idli Mix', 'Ready to Cook', 500, 'g'],
    ['Gits', 'Gits Dhokla Mix', 'Ready to Cook', 200, 'g'],
  ],
  'snacks-namkeen': [
    ["Lay's", "Lay's Classic Salted Potato Chips", 'Chips', 52, 'g'],
    ["Lay's", "Lay's India's Magic Masala", 'Chips', 52, 'g'],
    ["Lay's", "Lay's India's Magic Masala Family Pack", 'Chips', 182, 'g'],
    ['Bingo', 'Bingo Mad Angles Tomato', 'Chips', 72, 'g'],
    ['Kurkure', 'Kurkure Masala Munch', 'Namkeen', 90, 'g'],
    ['Kurkure', 'Kurkure Masala Munch Family Pack', 'Namkeen', 198, 'g'],
    ["Haldiram's", "Haldiram's Aloo Bhujia", 'Namkeen', 200, 'g'],
    ["Haldiram's", "Haldiram's Moong Dal", 'Namkeen', 200, 'g'],
    ["Haldiram's", "Haldiram's Bhel Puri", 'Namkeen', 150, 'g'],
    ["Haldiram's", "Haldiram's Navratan Mix", 'Namkeen', 200, 'g'],
    ["Haldiram's", "Haldiram's Khatta Meetha", 'Namkeen', 200, 'g'],
    ["Haldiram's", "Haldiram's Soan Papdi", 'Sweets Snack', 250, 'g'],
    ['Bikaji', 'Bikaji Bikaneri Bhujia', 'Namkeen', 200, 'g'],
    ['Balaji', 'Balaji Wafers Chatkazz', 'Chips', 150, 'g'],
    ['Uncle Chipps', 'Uncle Chipps Spicy Treat', 'Chips', 55, 'g'],
    ['Act II', 'Act II Butter Popcorn', 'Popcorn', 95, 'g'],
    ['Too Yumm', 'Too Yumm Multigrain Chips', 'Chips', 78, 'g'],
    ['Bingo', 'Bingo Tedhe Medhe Masala Pasta', 'Namkeen', 80, 'g'],
    ['DFM', 'DFM Methi Khakhra', 'Namkeen', 200, 'g'],
    ["Haldiram's", "Haldiram's Punjabi Tadka", 'Namkeen', 200, 'g'],
  ],
  'chocolates-sweets': [
    ['Cadbury', 'Cadbury Dairy Milk Chocolate', 'Chocolate', 55, 'g'],
    ['Cadbury', 'Cadbury Dairy Milk Silk', 'Chocolate', 60, 'g'],
    ['Nestle', 'Nestle KitKat', 'Chocolate', 36.4, 'g'],
    ['Nestle', 'Nestle Munch', 'Chocolate', 18, 'g'],
    ['Cadbury', 'Cadbury 5 Star', 'Chocolate', 41.7, 'g'],
    ['Cadbury', 'Cadbury Perk', 'Chocolate', 37, 'g'],
    ['Amul', 'Amul Dark Chocolate', 'Chocolate', 40, 'g'],
    ['Ferrero Rocher', 'Ferrero Rocher 4 Pieces', 'Chocolate', 50, 'g'],
    ['Cadbury', 'Cadbury Gems', 'Chocolate', 19.5, 'g'],
    ['Cadbury', 'Cadbury Bournville Rich Cocoa', 'Chocolate', 80, 'g'],
    ['Snickers', 'Snickers Chocolate Bar', 'Chocolate', 50, 'g'],
    ['Nestle', 'Nestle Milkybar', 'Chocolate', 24, 'g'],
    ['Parle', 'Parle Mango Bite', 'Candy', 100, 'g'],
    ['Alpenliebe', 'Alpenliebe Candy Pouch', 'Candy', 100, 'g'],
    ['Bikano', 'Bikano Soan Papdi', 'Sweets', 250, 'g'],
    ["Haldiram's", "Haldiram's Kaju Katli", 'Sweets', 250, 'g'],
    ["Haldiram's", "Haldiram's Gulab Jamun Tin", 'Sweets', 1, 'kg'],
    ['Bikano', 'Bikano Besan Laddu', 'Sweets', 250, 'g'],
    ["Haldiram's", "Haldiram's Motichoor Laddu", 'Sweets', 250, 'g'],
    ['Mother Dairy', 'Mother Dairy Rasmalai', 'Sweets', 200, 'g'],
  ],
  'tea-coffee-health-drinks': [
    ['Tata Tea', 'Tata Tea Gold', 'Tea', 1, 'kg'],
    ['Tata Tea', 'Tata Tea Premium', 'Tea', 1, 'kg'],
    ['Tata Tea', 'Tata Tea Chakra Gold', 'Tea', 1, 'kg'],
    ['Red Label', 'Red Label Tea', 'Tea', 1, 'kg'],
    ['Society', 'Society Tea', 'Tea', 1, 'kg'],
    ['Wagh Bakri', 'Wagh Bakri Premium Tea', 'Tea', 1, 'kg'],
    ['Lipton', 'Lipton Green Tea', 'Tea', 25, 'piece'],
    ['Tetley', 'Tetley Green Tea Lemon', 'Tea', 25, 'piece'],
    ['Patanjali', 'Patanjali Green Tea', 'Tea', 25, 'piece'],
    ['Nescafe', 'Nescafe Classic Instant Coffee', 'Coffee', 200, 'g'],
    ['Nescafe', 'Nescafe Sunrise Premium Coffee', 'Coffee', 200, 'g'],
    ['Nescafe', 'Nescafe Gold Blend Coffee', 'Coffee', 95, 'g'],
    ['Bru', 'Bru Instant Coffee', 'Coffee', 200, 'g'],
    ['Davidoff', 'Davidoff Rich Aroma Coffee', 'Coffee', 100, 'g'],
    ['Sleepy Owl', 'Sleepy Owl Cold Brew Coffee', 'Coffee', 200, 'ml'],
    ['Horlicks', 'Horlicks Health Drink', 'Health Drink', 500, 'g'],
    ['Bournvita', 'Bournvita Health Drink', 'Health Drink', 500, 'g'],
    ['Complan', 'Complan Health Drink', 'Health Drink', 500, 'g'],
    ['Boost', 'Boost Health Drink', 'Health Drink', 500, 'g'],
    ['Organic Tattva', 'Organic Tattva Turmeric Latte Mix', 'Health Drink', 200, 'g'],
  ],
  'cold-drinks-juices-water': [
    ['Coca-Cola', 'Coca-Cola Soft Drink', 'Soft Drink', 750, 'ml'],
    ['Pepsi', 'Pepsi Soft Drink', 'Soft Drink', 750, 'ml'],
    ['Sprite', 'Sprite Soft Drink', 'Soft Drink', 750, 'ml'],
    ['Fanta', 'Fanta Orange Soft Drink', 'Soft Drink', 750, 'ml'],
    ['Thums Up', 'Thums Up Soft Drink', 'Soft Drink', 750, 'ml'],
    ['Limca', 'Limca Soft Drink', 'Soft Drink', 750, 'ml'],
    ['Real', 'Real Mixed Fruit Juice', 'Juice', 1, 'l'],
    ['Tropicana', 'Tropicana Orange Juice', 'Juice', 1, 'l'],
    ['Minute Maid', 'Minute Maid Pulpy Orange', 'Juice', 1, 'l'],
    ['Paper Boat', 'Paper Boat Aamras', 'Juice', 200, 'ml'],
    ['Frooti', 'Frooti Mango Drink', 'Juice', 600, 'ml'],
    ['Maaza', 'Maaza Mango Drink', 'Juice', 600, 'ml'],
    ['Appy', 'Appy Fizz Apple Drink', 'Juice', 600, 'ml'],
    ['Rasna', 'Rasna Instant Drink Mix Orange', 'Drink Mix', 500, 'g'],
    ['Bisleri', 'Bisleri Packaged Drinking Water', 'Water', 1, 'l'],
    ['Kinley', 'Kinley Packaged Drinking Water', 'Water', 1, 'l'],
    ['Bisleri', 'Bisleri Soda', 'Soda', 750, 'ml'],
    ['Sting', 'Sting Energy Drink', 'Energy Drink', 250, 'ml'],
    ['Red Bull', 'Red Bull Energy Drink', 'Energy Drink', 250, 'ml'],
    ['Gatorade', 'Gatorade Sports Drink', 'Sports Drink', 500, 'ml'],
  ],
  'frozen-food-ice-cream': [
    ['Amul', 'Amul Vanilla Ice Cream Tub', 'Ice Cream', 1, 'l'],
    ['Amul', 'Amul Butterscotch Ice Cream Tub', 'Ice Cream', 1, 'l'],
    ['Mother Dairy', 'Mother Dairy Kesar Pista Ice Cream', 'Ice Cream', 700, 'ml'],
    ['Kwality Walls', 'Kwality Walls Cornetto Choc Vanilla', 'Ice Cream', 1, 'piece'],
    ['Kwality Walls', 'Kwality Walls Feast Choco Bar', 'Ice Cream', 1, 'piece'],
    ['Baskin Robbins', 'Baskin Robbins Ice Cream Tub', 'Ice Cream', 500, 'ml'],
    ['McCain', 'McCain French Fries', 'Frozen Snacks', 420, 'g'],
    ['McCain', 'McCain Smiles Potato Snacks', 'Frozen Snacks', 425, 'g'],
    ['McCain', 'McCain Aloo Tikki', 'Frozen Snacks', 400, 'g'],
    ['ITC Master Chef', 'ITC Master Chef Veg Nuggets', 'Frozen Snacks', 425, 'g'],
    ['Godrej Yummiez', 'Godrej Yummiez Chicken Nuggets', 'Frozen Snacks', 425, 'g'],
    ['Godrej Yummiez', 'Godrej Yummiez Veg Spring Roll', 'Frozen Snacks', 400, 'g'],
    ['Sumeru', 'Sumeru Frozen Mixed Vegetables', 'Frozen Vegetables', 500, 'g'],
    ['Sumeru', 'Sumeru Frozen Sweet Corn', 'Frozen Vegetables', 500, 'g'],
    ['Safal', 'Safal Frozen Green Peas', 'Frozen Vegetables', 500, 'g'],
    ['Amul', 'Amul Frozen Green Peas', 'Frozen Vegetables', 500, 'g'],
    ['Amul', 'Amul Frozen Malabar Paratha', 'Frozen Bread', 320, 'g'],
    ['ID Fresh', 'ID Fresh Frozen Parotta', 'Frozen Bread', 400, 'g'],
    ['ID Fresh', 'ID Fresh Idli Dosa Batter', 'Batter', 1, 'kg'],
    ['Vadilal', 'Vadilal Frozen Gulab Jamun', 'Frozen Sweets', 500, 'g'],
  ],
};

function buildDescription(categorySlug, subCategory, name, weight, weightUnit) {
  const filler = CATEGORY_DESCRIPTION_FILLER[categorySlug] || 'a popular grocery item';
  return `${name} is ${filler}, in the ${subCategory} range. Pack size: ${weight}${weightUnit}.`;
}

function buildTags(brand, name, subCategory) {
  const words = `${name}`.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const tagSet = new Set([brand.toLowerCase(), subCategory.toLowerCase(), ...words]);
  return Array.from(tagSet).filter(Boolean);
}

function buildProducts() {
  const products = [];
  for (const category of CATEGORIES) {
    const defs = PRODUCTS_BY_CATEGORY[category.slug] || [];
    for (const [brand, name, subCategory, weight, weightUnit] of defs) {
      products.push({
        // --- Product schema fields (GMkart-backend/models/product.js) ---
        name,
        description: buildDescription(category.slug, subCategory, name, weight, weightUnit),
        brand,
        category: category.slug, // TODO: replace with the real Category _id

        price: null, // TODO: required - set selling price
        oldPrice: null, // TODO: set MRP (strikethrough price)
        discountPercentage: 0,

        hsnCode: null, // TODO: verify with finance/compliance
        gstPercent: null, // TODO: verify with finance/compliance
        taxType: 'inclusive',

        unit: weightUnit,
        unitValue: weight,

        seller: null, // TODO: set seller _id
        shop: null, // TODO: set shop _id

        quantity: null, // TODO: set stock quantity
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 10,

        weight,
        weightUnit,

        images: [], // TODO: add { url, altText, isPrimary, order } entries (max 5)
        variants: [],
        serviceablePincodes: [],

        isActive: true,

        // --- Auxiliary fields, not part of the Product schema (see header note) ---
        subCategory,
        tags: buildTags(brand, name, subCategory),
      });
    }
  }
  return products;
}

function buildCategories() {
  return CATEGORIES.map((category, index) => ({
    // --- Category schema fields (GMkart-backend/models/category.js) ---
    name: category.name,
    image: null, // TODO: add category image URL
    hsnCode: null, // TODO: verify with finance/compliance
    gstPercent: null, // TODO: verify with finance/compliance
    taxType: 'inclusive',
    defaultUOM: category.defaultUOM,
    isActive: true,
    sortOrder: index * 10,

    // --- Auxiliary fields, not part of the Category schema ---
    slug: category.slug,
    description: category.description,
  }));
}

function generate() {
  const products = buildProducts();
  const categories = buildCategories();
  const output = {
    generatedAt: new Date().toISOString(),
    requiredFieldsToFillPerProduct: REQUIRED_FIELDS_TO_FILL,
    optionalFieldsToReviewPerProduct: OPTIONAL_FIELDS_TO_REVIEW,
    complianceFieldsToVerify: COMPLIANCE_FIELDS_TO_VERIFY,
    totalCategories: categories.length,
    totalProducts: products.length,
    categories,
    products,
  };

  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'master-food-products.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Generated ${products.length} products across ${categories.length} categories -> ${outPath}`);
}

generate();
