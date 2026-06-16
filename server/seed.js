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
const Agency        = require('./models/Agency');
const TalentProfile = require('./models/TalentProfile');

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
  // Talent portraits
  model_f1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
  model_m1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
  model_f2: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
  makeup:   'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
  photog:   'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80',
  stylist:  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
  designer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  model_m2: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
};

// Fashion talent agencies, each with their roster of talent
const AGENCIES = [
  {
    agencyName: 'Elite Models Qatar', email: 'elite@linesbyams.qa',
    description: 'Qatar’s premier modelling agency representing top runway and editorial talent.',
    isPremium: true,
    instagram: '@elitemodelsqatar', whatsapp: '+97455100001',
    talent: [
      { name: 'Sara Al-Mansouri', nameAr: 'سارة المنصوري', photo: 'model_f1', location: 'Doha, Qatar', experience: 6, availability: 'Available', skills: ['Model','Brand Ambassador'], contractTypes: ['Yearly','Monthly'], salaryRange: { min: 8000, max: 15000 }, bio: 'Runway and editorial model with international campaign experience across the GCC.' },
      { name: 'Omar Khalid', nameAr: 'عمر خالد', photo: 'model_m1', location: 'Doha, Qatar', experience: 4, availability: 'Available', skills: ['Model','Brand Ambassador'], contractTypes: ['Monthly','Hourly'], salaryRange: { min: 6000, max: 12000 }, bio: 'Menswear and commercial model, face of several regional fashion brands.' },
      { name: 'Layla Hassan', nameAr: 'ليلى حسن', photo: 'model_f2', location: 'Lusail, Qatar', experience: 8, availability: 'Booked', skills: ['Model'], contractTypes: ['Yearly'], salaryRange: { min: 10000, max: 18000 }, bio: 'Senior fashion model specialising in haute couture and luxury campaigns.' },
    ],
  },
  {
    agencyName: 'Doha Talent House', email: 'dohatalent@linesbyams.qa',
    description: 'Full-service creative talent house — makeup, photography and styling for fashion shoots.',
    isPremium: false,
    instagram: '@dohatalenthouse', whatsapp: '+97455100002',
    talent: [
      { name: 'Fatima Noor', nameAr: 'فاطمة نور', photo: 'makeup', location: 'Doha, Qatar', experience: 7, availability: 'Available', skills: ['Makeup Artist','Hair Stylist'], contractTypes: ['Monthly','Hourly'], salaryRange: { min: 4000, max: 9000 }, bio: 'Editorial makeup artist for fashion week shows and bridal campaigns.' },
      { name: 'Yousef Ahmed', nameAr: 'يوسف أحمد', photo: 'photog', location: 'Al Rayyan, Qatar', experience: 9, availability: 'Available', skills: ['Photographer','Videographer'], contractTypes: ['Monthly','Hourly'], salaryRange: { min: 5000, max: 14000 }, bio: 'Fashion photographer and videographer with a sharp editorial eye.' },
      { name: 'Aisha Rahman', nameAr: 'عائشة رحمن', photo: 'stylist', location: 'Doha, Qatar', experience: 5, availability: 'Available', skills: ['Stylist','Wardrobe Manager'], contractTypes: ['Monthly'], salaryRange: { min: 4500, max: 10000 }, bio: 'Wardrobe stylist for shoots, runway and personal styling clients.' },
    ],
  },
  {
    agencyName: 'Mirage Creative Agency', email: 'mirage@linesbyams.qa',
    description: 'Design-led agency representing fashion designers, art directors and influencers.',
    isPremium: true,
    instagram: '@miragecreative', whatsapp: '+97455100003',
    talent: [
      { name: 'Khalid Mansour', nameAr: 'خالد منصور', photo: 'designer', location: 'Doha, Qatar', experience: 11, availability: 'Available', skills: ['Fashion Designer','Art Director'], contractTypes: ['Yearly','Monthly'], salaryRange: { min: 12000, max: 25000 }, bio: 'Award-winning fashion designer and creative director for luxury labels.' },
      { name: 'Noor Salem', nameAr: 'نور سالم', photo: 'model_m2', location: 'Lusail, Qatar', experience: 3, availability: 'Available', skills: ['Social Media Influencer','Brand Ambassador'], contractTypes: ['Monthly','Hourly'], salaryRange: { min: 3000, max: 8000 }, bio: 'Fashion content creator and brand ambassador with a strong Gulf following.' },
    ],
  },
];

const SHOPS = [
  {
    name: 'Nour Abayas Boutique', nameAr: 'بوتيك نور للعبايات',
    category: 'Abayas', location: 'Doha, Qatar',
    description: 'Handcrafted abayas and modest wear from the heart of Doha. Each piece made with love.',
    descriptionAr: 'عبايات وأزياء محتشمة مصنوعة يدويًا من قلب الدوحة.',
    whatsapp: '+97455001234', instagram: '@nour_abayas',
    coverImage: IMG.abaya2, isPremium: true,
    paymentMethods: ['cash', 'apple_pay', 'visa', 'mastercard'],
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
    coverImage: IMG.perfume, isPremium: true,
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
    coverImage: IMG.dress, isPremium: false,
    paymentMethods: ['cash', 'visa', 'mastercard', 'paypal'],
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
    coverImage: IMG.bag, isPremium: false,
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
    coverImage: IMG.jewel, isPremium: false,
    paymentMethods: ['cash', 'apple_pay', 'visa', 'paypal'],
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
    coverImage: IMG.kids, isPremium: false,
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

    // 4) Fashion talent agencies + their talent rosters
    let agencyCount = 0, talentCount = 0;
    for (const a of AGENCIES) {
      const { talent, email, instagram, whatsapp, isPremium, agencyName, description } = a;
      // Agency-owner user account
      let agencyUser = await User.findOne({ email });
      if (!agencyUser) {
        agencyUser = await User.create({
          name: agencyName, email, password: 'agency123456',
          role: 'agency', location: 'Doha, Qatar',
        });
      }
      const agency = await Agency.create({
        user: agencyUser._id, agencyName, description,
        isPremium, isApproved: true,
        socialLinks: { instagram, whatsapp },
      });
      agencyCount++;
      for (const t of talent) {
        const { photo, ...rest } = t;
        await TalentProfile.create({
          ...rest,
          photo: IMG[photo] || '',
          portfolio: [IMG[photo] || ''],
          agency: agency._id,
        });
        talentCount++;
      }
    }

    console.log(`[seed] ✓ Seeded ${agencyCount} agencies and ${talentCount} talent profiles.`);
  } catch (err) {
    console.error('[seed] Seeding failed:', err.message);
  }
}

module.exports = seedDatabase;
