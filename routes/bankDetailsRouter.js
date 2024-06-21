// routes/bankDetailsRouter.js
const express = require('express');
const {
    createOrUpdateBankDetails,
    updateBankDetails,
    getBankDetails,
} = require('../controllers/bankDetailsController');

const router = express.Router();

router.post('/:employee_id', createOrUpdateBankDetails);
router.put('/:employee_id', updateBankDetails);
router.get('/:employee_id', getBankDetails);

module.exports = router;