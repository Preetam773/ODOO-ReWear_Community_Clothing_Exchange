const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getSwapRequests,
  updateSwapRequest,
  deleteSwapRequest
} = require('../controllers/swapController');
const auth = require('../middleware/auth');

router.post('/', auth, createSwapRequest);
router.get('/', auth, getSwapRequests);
router.put('/:id', auth, updateSwapRequest);
router.delete('/:id', auth, deleteSwapRequest);

module.exports = router;