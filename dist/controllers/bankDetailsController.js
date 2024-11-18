// controllers/bankDetailsController.js
'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var createOrUpdateBankDetails = function createOrUpdateBankDetails(req, res) {
    var employee_id, _req$body, bankName, accountNumber, ifscCode, panNumber, aadharNumber, pfNumber, bankDetail;

    return regeneratorRuntime.async(function createOrUpdateBankDetails$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employee_id = req.params.employee_id;
                _req$body = req.body;
                bankName = _req$body.bankName;
                accountNumber = _req$body.accountNumber;
                ifscCode = _req$body.ifscCode;
                panNumber = _req$body.panNumber;
                aadharNumber = _req$body.aadharNumber;
                pfNumber = _req$body.pfNumber;
                context$1$0.prev = 8;
                context$1$0.next = 11;
                return regeneratorRuntime.awrap(prisma.bankDetail.upsert({
                    where: { employee_id: employee_id },
                    update: {
                        bankName: bankName,
                        accountNumber: accountNumber,
                        ifscCode: ifscCode,
                        panNumber: panNumber,
                        aadharNumber: aadharNumber,
                        pfNumber: pfNumber
                    },
                    create: {
                        bankName: bankName,
                        accountNumber: accountNumber,
                        ifscCode: ifscCode,
                        panNumber: panNumber,
                        aadharNumber: aadharNumber,
                        pfNumber: pfNumber,
                        employee_id: employee_id
                    }
                }));

            case 11:
                bankDetail = context$1$0.sent;

                res.status(201).json(bankDetail);
                context$1$0.next = 19;
                break;

            case 15:
                context$1$0.prev = 15;
                context$1$0.t0 = context$1$0['catch'](8);

                console.error('Error saving bank details:', context$1$0.t0);
                res.status(500).json({ error: 'Failed to save bank details' });

            case 19:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[8, 15]]);
};

var updateBankDetails = function updateBankDetails(req, res) {
    var employee_id, _req$body2, bankName, accountNumber, ifscCode, panNumber, aadharNumber, pfNumber, bankDetail;

    return regeneratorRuntime.async(function updateBankDetails$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employee_id = req.params.employee_id;
                _req$body2 = req.body;
                bankName = _req$body2.bankName;
                accountNumber = _req$body2.accountNumber;
                ifscCode = _req$body2.ifscCode;
                panNumber = _req$body2.panNumber;
                aadharNumber = _req$body2.aadharNumber;
                pfNumber = _req$body2.pfNumber;
                context$1$0.prev = 8;
                context$1$0.next = 11;
                return regeneratorRuntime.awrap(prisma.bankDetail.update({
                    where: { employee_id: employee_id },
                    data: {
                        bankName: bankName,
                        accountNumber: accountNumber,
                        ifscCode: ifscCode,
                        panNumber: panNumber,
                        aadharNumber: aadharNumber,
                        pfNumber: pfNumber
                    }
                }));

            case 11:
                bankDetail = context$1$0.sent;

                res.status(200).json(bankDetail);
                context$1$0.next = 19;
                break;

            case 15:
                context$1$0.prev = 15;
                context$1$0.t0 = context$1$0['catch'](8);

                console.error('Error updating bank details:', context$1$0.t0);
                res.status(500).json({ error: 'Failed to update bank details' });

            case 19:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[8, 15]]);
};

var getBankDetails = function getBankDetails(req, res) {
    var employee_id, bankDetail;
    return regeneratorRuntime.async(function getBankDetails$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employee_id = req.params.employee_id;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.bankDetail.findUnique({
                    where: { employee_id: employee_id }
                }));

            case 4:
                bankDetail = context$1$0.sent;

                if (bankDetail) {
                    res.json(bankDetail);
                } else {
                    res.status(404).json({ error: 'Bank details not found' });
                }
                context$1$0.next = 12;
                break;

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0['catch'](1);

                console.error('Error fetching bank details:', context$1$0.t0);
                res.status(500).json({ error: 'Internal server error' });

            case 12:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 8]]);
};

module.exports = {
    createOrUpdateBankDetails: createOrUpdateBankDetails,
    updateBankDetails: updateBankDetails,
    getBankDetails: getBankDetails
};