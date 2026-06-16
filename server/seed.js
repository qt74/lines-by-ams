/**
 * Database seed — populates a fresh/empty DB with sample data so the site
 * looks alive on every restart (important for the in-memory dev DB).
 *
 * Runs automatically from server.js after DB connect, but ONLY if the DB
 * is empty (no shops). Safe to run against a real DB — it never overwrites
 * existing data.
 */
const User    = require('./models/User');
const Shop    = require('./models/Shop');
const Product = require('./models/Product');

const IMG = {
  abaya1:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  abaya2:   'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
  perfume:  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
  bag:      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  shoes:    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  jewel:    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  dress:    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  kids:     'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80',
  scarf:    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
  cover1:   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
  cover2:   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
};

const SHOPS = [
  {
    name: 'Nour Abayas Boutique', nameAr: 'بوتيك نور للعبايات',
    category: 'Abayas', location: 'Doha, Qatar',
    description: 'Handcrafted abayas and modest wear from the heart of Doha. Each piece made with love.',
    descriptionAr: 'عبايات وأزياء محتشمة مصنوعة يدويًا من قلب الدوحة.',
    whatsapp: '+97455001234', instagram: '@nour_abayas',
    coverImage: IMG.cover1, isPremium: true,
    paymentMethods: ['cash', 'apple_pay', 'visa', 'mada'],
    products: [
      { name: 'Handmade Abaya — Pearl White', nameAr: 'عباية مصنوعة يدويًا — أبيض لؤلؤي', price: 450, comparePrice: 600, category: 'Abayas', images: [IMG.abaya1], description: 'A stunning pearl-white abaya with hand-embroidered gold detail. Ethically handcrafted in Doha. Sizes XS–XL.' },
      { name: 'Classic Black Abaya', nameAr: 'عباية سوداء كلاسيكية', price: 380, category: 'Abayas', images: [IMG.abaya2], description: 'Timeless black abaya in flowing crepe fabric. Everyday elegance.' },
      { name: 'Silk Hijab Set — Blush', nameAr: 'طقم حجاب حرير — وردي', price: 120, category: 'Modest Wear', images: [IMG.scarf], description: 'Premium silk hijab in soft blush. Comes with matching undercap.' },
    ],
  },
  {
    name: 'Layla Perfumes', nameAr: 'عطور ليلى',
    category: 'Perfumes', location: 'Doha, Qatar',
    description: 'Authentic Arabian oud and modern fragrances, blended in small batches.',
    descriptionAr: 'عود عربي أصيل وعطور عصرية بكميات محدودة.',
    whatsapp: '+97455002345', instagram: '@layla_perfumes',
    coverImage: IMG.cover2, isPremium: true,
    paymentMethods: ['cash', 'apple_pay', 'google_pay', 'visa'],
    products: [
      { name: 'Royal Oud — 50ml', nameAr: 'عود ملكي — ٥٠ مل', price: 320, comparePrice: 400, category: 'Perfumes', images: [IMG.perfume], description: 'Deep, smoky oud with amber and rose. Long-lasting attar.' },
      { name: 'Musk Al Tahara', nameAr: 'مسك الطهارة', price: 85, category: 'Perfumes', images: [IMG.perfume], description: 'Soft white musk, alcohol-free. A Gulf classic.' },
    ],
  },
  {
    name: 'Mariam Couture', nameAr: 'مريم كوتور',
    category: 'Fashion', location: 'Al Wakrah, Qatar',
    description: 'Evening gowns and occasion wear designed for the modern Gulf woman.',
    descriptionAr: 'فساتين سهرة وأزياء مناسبات للمرأة الخليجية العصرية.',
    whatsapp: '+97455003456', instagram: '@mariam_couture',
    coverImage: IMG.cover1, isPremium: false,
    paymentMethods: ['cash', 'visa', 'mastercard', 'tabby'],
    products: [
      { name: 'Emerald Evening Gown', nameAr: 'فستان سهرة زمردي', price: 950, comparePrice: 1200, category: 'Fashion', images: [IMG.dress], description: 'Floor-length emerald gown with beaded bodice. Made to order.' },
      { name: 'Champagne Kaftan', nameAr: 'قفطان شمبانيا', price: 540, category: 'Fashion', images: [IMG.dress], description: 'Flowing champagne kaftan with gold trim. One size.' },
    ],
  },
  {
    name: 'Doha Bags & Co', nameAr: 'دوحة باجز',
    category: 'Bags & Purses', location: 'Doha, Qatar',
    description: 'Handpicked leather bags and clutches. Quality that lasts.',
    descriptionAr: 'حقائب جلدية مختارة بعناية تدوم طويلاً.',
    whatsapp: '+97455004567', instagram: '@doha_bags',
    coverImage: IMG.cover2, isPremium: false,
    paymentMethods: ['cash', 'apple_pay', 'visa'],
    products: [
      { name: 'Leather Tote — Tan', nameAr: 'حقيبة جلدية — بني', price: 280, category: 'Bags & Purses', images: [IMG.bag], description: 'Spacious genuine-leather tote in warm tan. Fits a laptop.' },
      { name: 'Evening Clutch — Gold', nameAr: 'حقيبة سهرة — ذهبي', price: 150, comparePrice: 195, category: 'Bags & Purses', images: [IMG.bag], description: 'Sparkling gold clutch with chain strap. Perfect for events.' },
    ],
  },
  {
    name: 'Aisha Jewellery', nameAr: 'مجوهرات عائشة',
    category: 'Jewellery', location: 'Lusail, Qatar',
    description: 'Delicate gold-plated and pearl jewellery, handmade in Qatar.',
    descriptionAr: 'مجوهرات مطلية بالذهب واللؤلؤ، صناعة قطرية يدوية.',
    whatsapp: '+97455005678', instagram: '@aisha_jewellery',
    coverImage: IMG.cover1, isPremium: false,
    paymentMethods: ['cash', 'apple_pay', 'mada', 'tamara'],
    products: [
      { name: 'Pearl Drop Earrings', nameAr: 'أقراط لؤلؤ متدلية', price: 180, category: 'Jewellery', images: [IMG.jewel], description: 'Freshwater pearl drops on gold-plated hooks.' },
      { name: 'Gold Layered Necklace', nameAr: 'عقد ذهبي متعدد الطبقات', price: 220, comparePrice: 280, category: 'Jewellery', images: [IMG.jewel], description: 'Three-layer gold-plated chain necklace. Tarnish-resistant.' },
    ],
  },
  {
    name: 'Little Stars Kids', nameAr: 'نجوم صغيرة للأطفال',
    category: 'Kids Fashion', location: 'Al Rayyan, Qatar',
    description: 'Adorable, comfortable outfits for little ones aged 0–8.',
    descriptionAr: 'ملابس مريحة وجميلة للأطفال من ٠ إلى ٨ سنوات.',
    whatsapp: '+97455006789', instagram: '@little_stars_qa',
    coverImage: IMG.cover2, isPremium: false,
    paymentMethods: ['cash', 'visa', 'google_pay'],
    products: [
      { name: 'Kids Eid Outfit Set', nameAr: 'طقم عيد للأطفال', price: 160, comparePrice: 210, category: 'Kids Fashion', images: [IMG.kids], description: 'Two-piece festive set with embroidered vest. Ages 2–6.' },
      { name: 'Cotton Romper — Sky Blue', nameAr: 'رومبر قطني — أزرق سماوي', price: 75, category: 'Kids Fashion', images: [IMG.kids], description: 'Soft breathable cotton romper for babies. 0–18 months.' },
    ],
  },
];

async function seedDatabase() {
  try {
    const existing = await Shop.countDocuments();
    if (existing > 0) {
      console.log(`[seed] DB already has ${existing} shops — skipping seed.`);
      return;
    }

    console.log('[seed] Empty DB detected — seeding sample data…');

    // 1) Admin account (so the admin panel works out of the box)
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@linesbyams.qa';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin', email: adminEmail,
        password: process.env.SEED_ADMIN_PASSWORD || 'admin123456',
        role: 'admin', location: 'Doha, Qatar',
      });
      console.log(`[seed] Created admin → ${adminEmail} / ${process.env.SEED_ADMIN_PASSWORD || 'admin123456'}`);
    }

    // 2) A sample shop-owner account that owns all the seeded shops
    let owner = await User.findOne({ email: 'demo@linesbyams.qa' });
    if (!owner) {
      owner = await User.create({
        name: 'Demo Boutique Owner', email: 'demo@linesbyams.qa',
        password: 'demo123456', role: 'customer', location: 'Doha, Qatar',
        phone: '+97455000000',
      });
    }

    // 3) Shops + their products
    let shopCount = 0, prodCount = 0;
    for (const s of SHOPS) {
      const { products, ...shopData } = s;
      const shop = await Shop.create({ ...shopData, owner: owner._id });
      shopCount++;
      for (const p of products) {
        await Product.create({ ...p, shop: shop._id, owner: owner._id });
        prodCount++;
      }
    }

    console.log(`[seed] ✓ Seeded ${shopCount} shops and ${prodCount} products.`);
  } catch (err) {
    console.error('[seed] Seeding failed:', err.message);
  }
}

module.exports = seedDatabase;
