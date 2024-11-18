'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var authorizeUser = function authorizeUser(req, res) {
    var userEmail, user;
    return regeneratorRuntime.async(function authorizeUser$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                userEmail = req.body.userEmail;

                if (userEmail) {
                    context$1$0.next = 3;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('Email is required'));

            case 3:
                context$1$0.prev = 3;
                context$1$0.next = 6;
                return regeneratorRuntime.awrap(prisma.user.findUnique({
                    where: {
                        email: userEmail
                    }
                }));

            case 6:
                user = context$1$0.sent;

                if (user) {
                    context$1$0.next = 9;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('User not found or not authorized'));

            case 9:
                return context$1$0.abrupt('return', res.status(200).json({ role: user.role }));

            case 12:
                context$1$0.prev = 12;
                context$1$0.t0 = context$1$0['catch'](3);

                console.error('Internal server error:', context$1$0.t0); // Logging error
                return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

            case 16:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[3, 12]]);
};

module.exports = authorizeUser;