const SwapRequest = require('../models/SwapRequest');
const Item = require('../models/Item');
const User = require('../models/User');

const createSwapRequest = async (req, res) => {
  try {
    const { requestedItemId, offeredItemId, message } = req.body;

    // Get the requested item
    const requestedItem = await Item.findById(requestedItemId);
    if (!requestedItem) {
      return res.status(404).json({ message: 'Requested item not found' });
    }

    // Check if user is trying to swap with themselves
    if (requestedItem.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot swap with yourself' });
    }

    // Check if offered item exists and belongs to user (if not a donation)
    if (offeredItemId) {
      const offeredItem = await Item.findById(offeredItemId);
      if (!offeredItem || offeredItem.owner.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Invalid offered item' });
      }
    }

    // Check if swap request already exists
    const existingRequest = await SwapRequest.findOne({
      requester: req.user.id,
      requestedItem: requestedItemId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Swap request already exists' });
    }

    const swapRequest = new SwapRequest({
      requester: req.user.id,
      owner: requestedItem.owner,
      requestedItem: requestedItemId,
      offeredItem: offeredItemId,
      message
    });

    await swapRequest.save();
    await swapRequest.populate([
      { path: 'requester', select: 'name avatar rating' },
      { path: 'owner', select: 'name avatar rating' },
      { path: 'requestedItem', select: 'title images' },
      { path: 'offeredItem', select: 'title images' }
    ]);

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSwapRequests = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    let query = {};

    if (type === 'sent') {
      query.requester = req.user.id;
    } else if (type === 'received') {
      query.owner = req.user.id;
    } else {
      query.$or = [
        { requester: req.user.id },
        { owner: req.user.id }
      ];
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name avatar rating')
      .populate('owner', 'name avatar rating')
      .populate('requestedItem', 'title images')
      .populate('offeredItem', 'title images')
      .sort({ createdAt: -1 });

    res.json(swapRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSwapRequest = async (req, res) => {
  try {
    const { status, meetingDetails } = req.body;

    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Only owner can accept/reject, both parties can mark as completed
    if (status === 'accepted' || status === 'rejected') {
      if (swapRequest.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (status === 'completed') {
      if (swapRequest.owner.toString() !== req.user.id && 
          swapRequest.requester.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    swapRequest.status = status;
    if (meetingDetails) {
      swapRequest.meetingDetails = meetingDetails;
    }

    await swapRequest.save();
    await swapRequest.populate([
      { path: 'requester', select: 'name avatar rating' },
      { path: 'owner', select: 'name avatar rating' },
      { path: 'requestedItem', select: 'title images' },
      { path: 'offeredItem', select: 'title images' }
    ]);

    // If accepted, mark items as unavailable
    if (status === 'accepted') {
      await Item.findByIdAndUpdate(swapRequest.requestedItem, { available: false });
      if (swapRequest.offeredItem) {
        await Item.findByIdAndUpdate(swapRequest.offeredItem, { available: false });
      }
    }

    res.json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Only requester can delete their own request
    if (swapRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  updateSwapRequest,
  deleteSwapRequest
};