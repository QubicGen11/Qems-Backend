// controllers/bankDetailsController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrUpdateBankDetails = async (req, res) => {
    const { employee_id } = req.params;
    const {
        bankName,
        accountNumber,
        ifscCode,
        panNumber,
        aadharNumber,
        pfNumber,
    } = req.body;

    try {
        const bankDetail = await prisma.bankDetail.upsert({
            where: { employee_id },
            update: {
                bankName,
                accountNumber,
                ifscCode,
                panNumber,
                aadharNumber,
                pfNumber,
            },
            create: {
                bankName,
                accountNumber,
                ifscCode,
                panNumber,
                aadharNumber,
                pfNumber,
                employee_id,
            },
        });
        res.status(201).json(bankDetail);
    } catch (error) {
        console.error('Error saving bank details:', error);
        res.status(500).json({ error: 'Failed to save bank details' });
    }
};

const updateBankDetails = async (req, res) => {
    const { employee_id } = req.params;
    const {
        bankName,
        accountNumber,
        ifscCode,
        panNumber,
        aadharNumber,
        pfNumber,
    } = req.body;

    try {
        const bankDetail = await prisma.bankDetail.update({
            where: { employee_id },
            data: {
                bankName,
                accountNumber,
                ifscCode,
                panNumber,
                aadharNumber,
                pfNumber,
            },
        });
        res.status(200).json(bankDetail);
    } catch (error) {
        console.error('Error updating bank details:', error);
        res.status(500).json({ error: 'Failed to update bank details' });
    }
};

const getBankDetails = async (req, res) => {
    const { employee_id } = req.params;

    try {
        const bankDetail = await prisma.bankDetail.findUnique({
            where: { employee_id: employee_id },
        });

        if (bankDetail) {
            res.json(bankDetail);
        } else {
            res.status(404).json({ error: 'Bank details not found' });
        }
    } catch (error) {
        console.error('Error fetching bank details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createOrUpdateBankDetails,
    updateBankDetails,
    getBankDetails,
};