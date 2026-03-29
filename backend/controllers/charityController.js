const mongoose = require('mongoose');
const Charity = require('../models/Charity');

// GET /api/charities - Sab charities (filters ke saath)
const getCharities = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [charities, total] = await Promise.all([
      Charity.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Charity.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: charities,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/charities/featured - Featured charities
const getFeaturedCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ isFeatured: true, isActive: true }).limit(3);

    res.status(200).json({ success: true, data: charities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/charities/:id - ID ya Slug dono se dhundhe
const getCharityById = async (req, res) => {
  try {
    const { id } = req.params;

    const charity = mongoose.isValidObjectId(id)
      ? await Charity.findById(id)
      : await Charity.findOne({ slug: id });

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity nahi mili' });
    }

    res.status(200).json({ success: true, data: charity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/charities - Nayi charity banao
const createCharity = async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, data: charity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/charities/:id - Charity update karo
const updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity nahi mili' });
    }

    res.status(200).json({ success: true, data: charity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/charities/:id - Charity delete karo (soft delete)
const deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity nahi mili' });
    }

    res.status(200).json({ success: true, message: 'Charity successfully delete ho gayi' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCharities,
  getFeaturedCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
};