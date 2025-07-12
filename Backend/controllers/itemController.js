const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');

const createItem = async (req, res) => {
  try {
    const { title, description, category, size, condition, brand, color, swapType, tags } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload_stream(
          { folder: 'rewear/items' },
          (error, result) => {
            if (error) throw error;
            return result;
          }
        );
        
        imageUrls.push(result.secure_url);
      }
    }

    const item = new Item({
      title,
      description,
      images: imageUrls,
      category,
      size,
      condition,
      brand,
      color,
      swapType,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      owner: req.user.id
    });

    await item.save();
    await item.populate('owner', 'name avatar rating');

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      size,
      condition,
      swapType,
      search,
      location
    } = req.query;

    const query = { available: true };

    // Build search filters
    if (category) query.category = category;
    if (size) query.size = size;
    if (condition) query.condition = condition;
    if (swapType) query.swapType = swapType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .populate('owner', 'name avatar rating location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name avatar rating location bio')
      .populate('interestedUsers', 'name avatar');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { title, description, category, size, condition, brand, color, swapType, tags } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Handle new images
    let imageUrls = item.images;
    if (req.files && req.files.length > 0) {
      imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload_stream(
          { folder: 'rewear/items' },
          (error, result) => {
            if (error) throw error;
            return result;
          }
        );
        
        imageUrls.push(result.secure_url);
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        images: imageUrls,
        category,
        size,
        condition,
        brand,
        color,
        swapType,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      },
      { new: true }
    ).populate('owner', 'name avatar rating');

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id })
      .populate('owner', 'name avatar rating')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toggleInterest = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is already interested
    const isInterested = item.interestedUsers.includes(req.user.id);

    if (isInterested) {
      item.interestedUsers = item.interestedUsers.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      item.interestedUsers.push(req.user.id);
    }

    await item.save();
    await item.populate('interestedUsers', 'name avatar');

    res.json({
      interested: !isInterested,
      interestedUsers: item.interestedUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getUserItems,
  toggleInterest
};