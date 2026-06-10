const Shop    = require('../models/Shop');
const Product = require('../models/Product');

// GET /api/shops  — public browse
exports.getShops = async (req, res) => {
  try {
    const { search, category, limit = 20, page = 1 } = req.query;
    const q = { isActive: true, isApproved: true };
    if (category) q.category = { $regex: category, $options: 'i' };
    if (search)   q.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await Shop.countDocuments(q);
    const shops = await Shop.find(q)
      .populate('productCount')
      .sort({ isPremium: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shops/:id  — public shop profile
exports.getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('productCount');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    shop.views += 1;
    await shop.save();
    const products = await Product.find({ shop: shop._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, shop, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/shops  — create shop (authenticated)
exports.createShop = async (req, res) => {
  try {
    const existing = await Shop.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already have a shop. Edit it from your dashboard.' });

    const { name, nameAr, description, descriptionAr, category, phone, whatsapp, instagram, location } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Shop name is required' });

    const logoUrl  = req.files?.logo?.[0]
      ? (req.files.logo[0].path?.startsWith('http') ? req.files.logo[0].path : `/uploads/${req.files.logo[0].filename}`)
      : req.body.logo || '';
    const coverUrl = req.files?.cover?.[0]
      ? (req.files.cover[0].path?.startsWith('http') ? req.files.cover[0].path : `/uploads/${req.files.cover[0].filename}`)
      : req.body.coverImage || '';

    const shop = await Shop.create({
      owner: req.user._id,
      name, nameAr, description, descriptionAr, category,
      phone, whatsapp, instagram, location,
      logo: logoUrl, coverImage: coverUrl,
    });

    res.status(201).json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/shops/:id  — update shop
exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found or not yours' });

    const updates = { ...req.body };
    if (req.files?.logo?.[0])  updates.logo  = req.files.logo[0].path?.startsWith('http')  ? req.files.logo[0].path  : `/uploads/${req.files.logo[0].filename}`;
    if (req.files?.cover?.[0]) updates.coverImage = req.files.cover[0].path?.startsWith('http') ? req.files.cover[0].path : `/uploads/${req.files.cover[0].filename}`;

    const updated = await Shop.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, shop: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shops/my  — owner's own shop
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id }).populate('productCount');
    res.json({ success: true, shop: shop || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
