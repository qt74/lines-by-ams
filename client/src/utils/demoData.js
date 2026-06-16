/**
 * Demo data for the public "showcase" build (e.g. GitHub Pages) where no
 * backend is available. The axios layer (utils/api.js) falls back to this
 * when a GET request to the API fails, so visitors can still browse shops
 * and products. Login / dashboard / ordering require the real backend.
 *
 * All images are absolute URLs so they work regardless of deploy base path.
 */
const IMG = {
  abaya1:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  abaya2:  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
  perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
  bag:     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  jewel:   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  dress:   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  kids:    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80',
  scarf:   'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
};

const PAY = ['cash', 'apple_pay', 'visa', 'mastercard', 'paypal'];

const shops = [
  {
    _id: 'demo-mariam', name: 'Mariam Couture', nameAr: 'مريم كوتور',
    category: 'Fashion', location: 'Al Wakrah, Qatar',
    description: 'Hand-beaded couture evening gowns, made to order for the modern Gulf woman.',
    coverImage: IMG.dress, logo: '', isPremium: true, whatsapp: '+97455003456',
    instagram: '@mariam_couture', paymentMethods: PAY,
    products: [
      { _id: 'p-couture-1', name: 'Pearl Constellation Gown', price: 4500, comparePrice: 5800, category: 'Fashion', images: [IMG.dress], inStock: true, description: 'Off-shoulder mermaid gown with hand-applied pearl and crystal fan beadwork over sheer sleeves. Made to order.' },
      { _id: 'p-couture-2', name: 'Golden Fan Couture Gown', price: 5200, category: 'Fashion', images: [IMG.dress], inStock: true, description: 'Gilded fan-pattern beaded bodice flowing into a finely pleated champagne skirt.' },
      { _id: 'p-couture-3', name: 'Champagne Cascade Gown', price: 4800, category: 'Fashion', images: [IMG.dress], inStock: true, description: 'Sweetheart beaded bodice with a high front slit and cascading pleated train.' },
      { _id: 'p-couture-4', name: 'Ruby Starlight Gown', price: 6500, category: 'Fashion', images: [IMG.dress], inStock: true, description: 'Golden lattice beadwork set with ruby-toned gemstones and a dramatic pleated slit skirt.' },
    ],
  },
  {
    _id: 'demo-nour', name: 'Nour Abayas Boutique', nameAr: 'بوتيك نور للعبايات',
    category: 'Abayas', location: 'Doha, Qatar',
    description: 'Handcrafted abayas and modest wear from the heart of Doha.',
    coverImage: IMG.abaya2, logo: '', isPremium: true, whatsapp: '+97455001234',
    instagram: '@nour_abayas', paymentMethods: PAY,
    products: [
      { _id: 'p-nour-1', name: 'Handmade Abaya — Pearl White', price: 450, comparePrice: 600, category: 'Abayas', images: [IMG.abaya1], inStock: true, description: 'A pearl-white abaya with hand-embroidered gold detail.' },
      { _id: 'p-nour-2', name: 'Classic Black Abaya', price: 380, category: 'Abayas', images: [IMG.abaya2], inStock: true, description: 'Timeless black abaya in flowing crepe fabric.' },
      { _id: 'p-nour-3', name: 'Silk Hijab Set — Blush', price: 120, category: 'Modest Wear', images: [IMG.scarf], inStock: true, description: 'Premium silk hijab in soft blush.' },
    ],
  },
  {
    _id: 'demo-layla', name: 'Layla Perfumes', nameAr: 'عطور ليلى',
    category: 'Perfumes', location: 'Doha, Qatar',
    description: 'Authentic Arabian oud and modern fragrances, blended in small batches.',
    coverImage: IMG.perfume, logo: '', isPremium: true, whatsapp: '+97455002345',
    instagram: '@layla_perfumes', paymentMethods: PAY,
    products: [
      { _id: 'p-layla-1', name: 'Royal Oud — 50ml', price: 320, comparePrice: 400, category: 'Perfumes', images: [IMG.perfume], inStock: true, description: 'Deep, smoky oud with amber and rose.' },
      { _id: 'p-layla-2', name: 'Musk Al Tahara', price: 85, category: 'Perfumes', images: [IMG.perfume], inStock: true, description: 'Soft white musk, alcohol-free.' },
    ],
  },
  {
    _id: 'demo-bags', name: 'Doha Bags & Co', nameAr: 'دوحة باجز',
    category: 'Bags & Purses', location: 'Doha, Qatar',
    description: 'Handpicked leather bags and clutches.',
    coverImage: IMG.bag, logo: '', isPremium: false, whatsapp: '+97455004567',
    instagram: '@doha_bags', paymentMethods: PAY,
    products: [
      { _id: 'p-bag-1', name: 'Leather Tote — Tan', price: 280, category: 'Bags & Purses', images: [IMG.bag], inStock: true, description: 'Spacious genuine-leather tote in warm tan.' },
      { _id: 'p-bag-2', name: 'Evening Clutch — Gold', price: 150, comparePrice: 195, category: 'Bags & Purses', images: [IMG.bag], inStock: true, description: 'Sparkling gold clutch with chain strap.' },
    ],
  },
  {
    _id: 'demo-aisha', name: 'Aisha Jewellery', nameAr: 'مجوهرات عائشة',
    category: 'Jewellery', location: 'Lusail, Qatar',
    description: 'Delicate gold-plated and pearl jewellery, handmade in Qatar.',
    coverImage: IMG.jewel, logo: '', isPremium: false, whatsapp: '+97455005678',
    instagram: '@aisha_jewellery', paymentMethods: PAY,
    products: [
      { _id: 'p-aisha-1', name: 'Pearl Drop Earrings', price: 180, category: 'Jewellery', images: [IMG.jewel], inStock: true, description: 'Freshwater pearl drops on gold-plated hooks.' },
      { _id: 'p-aisha-2', name: 'Gold Layered Necklace', price: 220, comparePrice: 280, category: 'Jewellery', images: [IMG.jewel], inStock: true, description: 'Three-layer gold-plated chain necklace.' },
    ],
  },
  {
    _id: 'demo-kids', name: 'Little Stars Kids', nameAr: 'نجوم صغيرة للأطفال',
    category: 'Kids Fashion', location: 'Al Rayyan, Qatar',
    description: 'Adorable, comfortable outfits for little ones aged 0–8.',
    coverImage: IMG.kids, logo: '', isPremium: false, whatsapp: '+97455006789',
    instagram: '@little_stars_qa', paymentMethods: PAY,
    products: [
      { _id: 'p-kids-1', name: 'Kids Eid Outfit Set', price: 160, comparePrice: 210, category: 'Kids Fashion', images: [IMG.kids], inStock: true, description: 'Two-piece festive set with embroidered vest.' },
      { _id: 'p-kids-2', name: 'Cotton Romper — Sky Blue', price: 75, category: 'Kids Fashion', images: [IMG.kids], inStock: true, description: 'Soft breathable cotton romper for babies.' },
    ],
  },
];

const shopSummary = (s) => {
  const { products, ...rest } = s;
  return { ...rest, productCount: products.length };
};

const allProducts = shops.flatMap(s =>
  s.products.map(p => ({
    ...p,
    shop: { _id: s._id, name: s.name, logo: s.logo, whatsapp: s.whatsapp, paymentMethods: s.paymentMethods },
  }))
);

/**
 * Returns a demo response body matching the real API shape for a given
 * GET path, or null if we don't have a fallback for it.
 */
export function demoResponse(pathname) {
  // strip /api prefix and query string
  const path = pathname.replace(/^.*\/api/, '').split('?')[0].replace(/\/$/, '');

  if (path === '/shops')    return { success: true, total: shops.length, shops: shops.map(shopSummary) };
  if (path === '/products') return { success: true, total: allProducts.length, products: allProducts };
  if (path === '/talent')   return { success: true, total: 0, talent: [] };
  if (path === '/agencies') return { success: true, agencies: [] };

  const shopMatch = path.match(/^\/shops\/([^/]+)$/);
  if (shopMatch) {
    const s = shops.find(x => x._id === shopMatch[1]) || shops[0];
    return { success: true, shop: shopSummary(s), products: s.products };
  }
  const prodMatch = path.match(/^\/products\/([^/]+)$/);
  if (prodMatch) {
    const p = allProducts.find(x => x._id === prodMatch[1]) || allProducts[0];
    return { success: true, product: p };
  }
  return null;
}
