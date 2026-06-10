const Product = require('../models/Product');
const Shop    = require('../models/Shop');

// GET /api/products  — public browse
exports.getProducts = async (req, res) => {
  try {
    const { search, category, shopId, minPrice, maxPrice, limit = 20, page = 1 } = req.query;
    const q = { isActive: true };
    if (shopId)    q.shop     = shopId;
    if (category)  q.category = { $regex: category, $options: 'i' };
    if (minPrice)  q.price    = { ...(q.price || {}), $gte: Number(minPrice) };
    if (maxPrice)  q.price    = { ...(q.price || {}), $lte: Number(maxPrice) };
    if (search)    q.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $in: [new RegExp(search, 'i')] } },
    ];

    const total    = await Product.countDocuments(q);
    const products = await Product.find(q)
      .populate('shop', 'name logo category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop', 'name logo whatsapp phone instagram location');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.views += 1;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products  — create (shop owner)
exports.createProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.status(400).json({ success: false, message: 'Create a shop first before adding products.' });

    const { name, nameAr, description, descriptionAr, price, comparePrice, category, tags, inStock, quantity } = req.body;
    if (!name)  return res.status(400).json({ success: false, message: 'Product name is required' });
    if (!price) return res.status(400).json({ success: false, message: 'Price is required' });

    // Handle uploaded images
    const images = (req.files || []).map(f =>
      f.path?.startsWith('http') ? f.path : `/uploads/${f.filename}`
    );
    // Also accept image URLs passed as JSON
    const bodyImages = Array.isArray(req.body.images) ? req.body.images : (req.body.images ? [req.body.images] : []);

    const product = await Product.create({
      shop:   shop._id,
      owner:  req.user._id,
      name, nameAr, description, descriptionAr,
      price:        Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : undefined,
      category, tags: tags ? [].concat(tags) : [],
      inStock: inStock !== 'false',
      quantity: quantity ? Number(quantity) : null,
      images: [...images, ...bodyImages],
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or not yours' });

    const updates = { ...req.body };
    if (updates.price)        updates.price        = Number(updates.price);
    if (updates.comparePrice) updates.comparePrice = Number(updates.comparePrice);
    if (updates.tags)         updates.tags         = [].concat(updates.tags);
    if (req.files?.length) {
      const newImgs = req.files.map(f => f.path?.startsWith('http') ? f.path : `/uploads/${f.filename}`);
      updates.images = [...(product.images || []), ...newImgs];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or not yours' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/my  — owner's products
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
