const { PrismaClient } = require('@prisma/client');
const excelToJson = require('convert-excel-to-json');
const multer = require('multer');
const fs = require('fs');
const prisma = new PrismaClient();

// Middleware to check access
const checkAccess = (user, requiredDepartments, requiredPositions) => {
    console.log("User: " + user)
    console.log("Required Positions: " + requiredPositions, requiredDepartments)
    return requiredDepartments.includes(user.role) && requiredPositions.includes(user.mainPosition);
};

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }).single('file'); // Expecting a file input named "file"

exports.createCMSEntry = async (req, res) => {
    try {
        const user = req.user;
        console.log("User:", user);

        // If user role is Admin, allow creation without additional checks
        if (user.role === 'Admin' || user.mainPosition === 'Lead Generation' || user.mainPosition === 'Executive' || user.mainPosition === 'Product Manager') {
            console.log("User role is Admin, proceeding with creation");
        } else {
            // Allowed roles
            const allowedRoles = ['Lead Generation', 'Executive', 'intern'];
            console.log("Checking against allowed roles:", allowedRoles);
            console.log("User mainPosition:", user.mainPosition);
            console.log("User role:", user.role);

            if (!allowedRoles.includes(user.mainPosition)) {
                console.log("Access denied - user role not in allowed list");
                return res.status(403).json({ success: false, message: 'Access Denied' });
            }

            // Check permission with checkAccess()
            const accessCheck = checkAccess(user, ['Product Management'], ['Admin', 'Lead Generation', 'Executive', 'intern', 'Product Manager']);
            console.log("Access check result:", accessCheck);
            if (!accessCheck) {
                return res.status(403).json({ success: false, message: 'Access Denied by checkAccess()' });
            }
        }

        // Destructure request body with new fields
        let {
            name, contact, email, branch, comfortableLanguage, assignedTo, comment,
            collegeName, yearOfStudying, courseOpt, registeredMonth,
            projectedAmount, preRegisteredAmount
        } = req.body;

        // Validate required fields
        if (!email && !contact) {
            return res.status(400).json({ success: false, message: 'At least one of email or contact field is required' });
        }

        if (assignedTo) {
            if (!(user.mainPosition === 'Product Manager' || user.role === 'Admin' || user.mainPosition === 'Executive' || user.mainPosition === 'Lead Generation')) {
                return res.status(403).json({ success: false, message: 'Only Product Manager or Admin can assign the assignedTo field' });
            } else {
                // If assignedTo is not provided, apply automatic assignment logic
                if (user.mainPosition === 'Executive') {
                    assignedTo = user.email; // Assign to the Executive itself
                } else if (user.mainPosition === 'Lead Generation') {
                    assignedTo = ""; // Set assignedTo as empty for Lead Generation
                }
            }
        }


        // Ensure financial values are properly parsed
        const parsedProjectedAmount = projectedAmount ? parseFloat(projectedAmount) : 0;
        const parsedPreRegisteredAmount = preRegisteredAmount ? parseFloat(preRegisteredAmount) : 0;
        const remainingAmount = parsedProjectedAmount - parsedPreRegisteredAmount; // Auto-calculate remaining amount

        // Check if contact already exists
        if (email && contact) {
            const existingEntry = await prisma.cMSEntry.findFirst({
                where: {
                    OR: [
                        { email: { equals: email, mode: "insensitive" } },
                        { contact: { equals: contact, mode: "insensitive" } }
                    ]
                }
            });

            if (existingEntry) {
                return res.status(409).json({ success: false, message: 'Contact already exists' });
            }
        }

        // Create entry using transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create CMS entry with auto-calculated remainingAmount
            const newEntry = await prisma.cMSEntry.create({
                data: {
                    name,
                    contact,
                    email,
                    branch,
                    comfortableLanguage,
                    assignedTo,
                    collegeName,
                    yearOfStudying: yearOfStudying ? parseInt(yearOfStudying) : null,
                    courseOpt,
                    registeredMonth,
                    projectedAmount: parsedProjectedAmount,
                    preRegisteredAmount: parsedPreRegisteredAmount,
                    remainingAmount, // Auto-calculated remainingAmount
                    createdByUserId: user.email,
                }
            });

            // If comment is provided, create a comment entry
            if (comment && comment.trim()) {
                await prisma.cMSEntryComment.create({
                    data: {
                        entryId: newEntry.id,
                        postedByUserId: user.email,
                        postedByUsername: user.username || user.email,
                        comment: comment.trim(),
                        postedAt: new Date()
                    }
                });
            }

            // Log creation action
            await prisma.cMSLog.create({
                data: {
                    action: 'CREATED',
                    details: `Entry '${newEntry.name}' was created by ${user.username || user.email}${comment ? ' with initial comment' : ''}`,
                    performedByUserId: user.email,
                    performedBy: user.username || user.email,
                    department: user.department,
                    role: user.role,
                    timestamp: new Date(),
                }
            });

            return newEntry;
        });

        return res.status(201).json({
            success: true,
            message: `Contact created successfully${comment ? ' with initial comment' : ''}`,
            data: result
        });

    } catch (error) {
        console.error('Error creating single CMS entry:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};




// ✅ **Step 1: Validate Data - No Database Insertion**
exports.validateAndImportCMSEntry = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            if (err) {
                return res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
            }

            const user = req.user;
            if (!((user.role !== 'Admin') || user.mainPosition !== 'Lead Generation')) {
                return res.status(403).json({ success: false, message: 'Access Denied' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            console.log('Processing Excel file:', req.file.path);

            // Convert Excel data to JSON
            const excelData = excelToJson({
                sourceFile: req.file.path,
                header: { rows: 1 },
                columnToKey: {
                    A: 'name',
                    B: 'contact',
                    C: 'email',
                    D: 'branch',
                    E: 'comfortableLanguage',
                    F: 'assignedTo',
                    G: 'collegeName',
                    H: 'yearOfStudying',
                    I: 'courseOpt',
                    J: 'registeredMonth',
                    K: 'projectedAmount',
                    L: 'preRegisteredAmount'
                }
            });

            // ✅ Ensure `assignedTo` is set for all entries from the logged-in user
            if (excelData.Sheet1) {
                excelData.Sheet1 = excelData.Sheet1.map(entry => ({
                    ...entry,
                    assignedTo: 
                        (user.mainPosition === 'Product Manager' || user.role === 'Admin') 
                            ? entry.assignedTo // Keep the assignedTo from the uploaded file
                        : (user.mainPosition === 'Executive') 
                            ? user.email // Assign to itself if Executive
                        : "" // If the user is Lead Generation, set assignedTo as empty
                }));
            }
            

            console.log('Excel data:', excelData);

            const validEntries = [];
            const invalidEntries = [];
            const seenContacts = new Set();
            const seenEmails = new Set();

            for (const entry of excelData.Sheet1) {
                // Validate required fields
                if (!entry.email || !entry.contact.toString() || !user.email) {
                    invalidEntries.push({ ...entry, reason: "Missing email or contact field" });
                    continue;
                }

                // Check for duplicate entries within the uploaded file
                if (seenContacts.has(entry.contact.toString()) || seenEmails.has(entry.email)) {
                    invalidEntries.push({ ...entry, reason: "Duplicate entry in Excel file" });
                    continue;
                }
                seenContacts.add(entry.contact.toString());
                seenEmails.add(entry.email);

                // Check if contact or email already exists in the database
                const existingEntry = await prisma.cMSEntry.findFirst({
                    where: { OR: [{ email: entry.email }, { contact: entry.contact.toString() }] }
                });

                if (existingEntry) {
                    invalidEntries.push({ ...entry, reason: "Duplicate entry in database" });
                } else {
                    // Convert numeric fields properly
                    const parsedProjectedAmount = entry.projectedAmount ? parseFloat(entry.projectedAmount) : 0;
                    const parsedPreRegisteredAmount = entry.preRegisteredAmount ? parseFloat(entry.preRegisteredAmount) : 0;
                    const remainingAmount = parsedProjectedAmount - parsedPreRegisteredAmount;

                    validEntries.push({
                        ...entry,
                        contact: entry.contact.toString(), // Convert contact to string
                        yearOfStudying: entry.yearOfStudying ? parseInt(entry.yearOfStudying) : null,
                        projectedAmount: parsedProjectedAmount,
                        preRegisteredAmount: parsedPreRegisteredAmount,
                        remainingAmount // Auto-calculated remainingAmount
                    });
                }
            }

            console.log('Validation Summary:', { validEntries, invalidEntries });

            // Delete file after processing
            fs.unlinkSync(req.file.path);

            // **🚀 If importData=true, insert into DB**
            if (req.query.importData === 'true' && validEntries.length > 0) {
                const importedEntries = [];

                for (const entry of validEntries) {
                    const newEntry = await prisma.cMSEntry.create({
                        data: {
                            name: entry.name,
                            contact: entry.contact,
                            email: entry.email,
                            branch: entry.branch,
                            comfortableLanguage: entry.comfortableLanguage,
                            assignedTo: entry.assignedTo,
                            collegeName: entry.collegeName,
                            yearOfStudying: entry.yearOfStudying,
                            courseOpt: entry.courseOpt,
                            registeredMonth: entry.registeredMonth,
                            projectedAmount: entry.projectedAmount,
                            preRegisteredAmount: entry.preRegisteredAmount,
                            remainingAmount: entry.remainingAmount,
                            createdByUserId: user.email
                        }
                    });

                    // Log the creation action for each imported entry
                    await prisma.cMSLog.create({
                        data: {
                            action: 'CREATED',
                            details: `Entry '${newEntry.name}' was created by ${user.username || user.email}`,
                            performedByUserId: user.email,
                            performedBy: user.username || user.email,
                            department: user.department,
                            role: user.role,
                            timestamp: new Date(),
                        }
                    });

                    importedEntries.push(newEntry);
                }

                return res.status(201).json({
                    success: true,
                    message: "Validation completed. Data imported successfully.",
                    importedEntries,
                    invalidEntries
                });
            }

            // **🚀 If importData=false, return only validation results**
            return res.status(200).json({
                success: true,
                message: "Validation completed.",
                validEntries,
                invalidEntries
            });

        } catch (error) {
            console.error('Error validating and importing CMS entry:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
};




// Add a comment to a CMS Entry
exports.addComment = async (req, res) => {
    try {
        const user = req.user;
        const { entryId, comment } = req.body;

        // Check if the entry exists
        const entry = await prisma.cMSEntry.findUnique({
            where: { id: entryId },
        });

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        const newComment = await prisma.cMSEntryComment.create({
            data: {
                entryId,
                comment,
                postedByUserId: user.email,
                postedByUsername: user.username
            },
        });

        // Log the comment action
        await prisma.cMSLog.create({
            data: {
                action: 'COMMENT_ADDED',
                details: `Comment added to entry '${entryId}' '${user.email}' by ${user.username || user.email}`,
                performedByUserId: user.email,
                performedBy: user.username || user.email,
                department: user.department,
                role: user.role,
                timestamp: new Date(),
            }
        });

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCommentsByEntryId = async (req, res) => {
    try {
        const { entryId } = req.params;

        console.log("Entry id is " + entryId);

        // Fetch all comments for the given entryId
        const comments = await prisma.cMSEntryComment.findMany({
            where: { entryId: entryId },
            orderBy: { createdAt: 'desc' } // Use the correct field for ordering
        });

        if (!comments.length) {
            return res.status(404).json({ success: false, message: 'No comments found for this entry' });
        }

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update Call Status or Follow-Up Status
exports.updateStatus = async (req, res) => {
    try {
        const user = req.user;
        console.log('User:', user);
        console.log('User main position:', user.mainPosition);
        console.log('User role:', user.role);

        if (!(
            user.mainPosition?.toLowerCase() === 'executive' ||
            user.mainPosition?.toLowerCase() === 'lead generation' ||
            user.role?.toLowerCase() === 'admin'
        )) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const { id } = req.params;
        const { callStatus, status } = req.body;

        console.log('Entry ID:', id);
        console.log('Call Status:', callStatus);
        console.log('Status:', status);

        // Check if the entry exists
        const entry = await prisma.cMSEntry.findUnique({
            where: { id },
        });
        console.log('Found entry:', entry);

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        // Ensure only the assigned executive can update the entry
        console.log('Entry assigned to:', entry.assignedTo);
        console.log('User email:', user.email);
        if (entry.assignedTo !== user.email && user.role !== 'Admin' && user.mainPosition !== 'Lead Generation') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const updatedEntry = await prisma.cMSEntry.update({
            where: { id },
            data: { callStatus, status },
        });
        console.log('Updated entry:', updatedEntry);

        // Log the update action
        const logEntry = await prisma.cMSLog.create({
            data: {
                action: 'UPDATED',
                details: `Entry '${updatedEntry.name}' email : ${updatedEntry.email} status was updated by ${user.username || user.email}`,
                performedByUserId: user.email,
                performedBy: user.username || user.email,
                department: user.department,
                role: user.role,
                timestamp: new Date(),
            }
        });
        console.log('Created log entry:', logEntry);

        res.status(200).json({ success: true, data: updatedEntry });
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get All CMS Entries
// ✅ **Fetch All CMS Entries**
exports.getAllCMSEntries = async (req, res) => {
    try {
        const user = req.user;

        const allowedRoles = ['Lead Generation', 'Executive', 'intern'];
        console.log("Checking against allowed roles:", allowedRoles);
        console.log("User role:", user.mainPosition);
        if (!allowedRoles.includes(user.mainPosition) && user.role !== 'Admin') {
            console.log("Access denied - user role not in allowed list");
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }


        let entries;
        if (user.mainPosition === 'Executive') {
            entries = await prisma.cMSEntry.findMany({
                where: { assignedTo: user.email },
                include: { comments: true },
                orderBy: { createdAt: 'desc' } // Fetch latest first
            });
        } else {
            entries = await prisma.cMSEntry.findMany({
                include: { comments: true },
                orderBy: { createdAt: 'desc' } // Fetch latest first
            });
        }

        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        console.error('Error fetching CMS entries:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Log Action
// ✅ **Log an Action with User Tracking**
exports.logAction = async (req, res) => {
    try {
        const user = req.user; // Extract user details from the middleware
        const { entryId, action, details } = req.body;

        if (!entryId || !action) {
            return res.status(400).json({ success: false, message: 'Entry ID and Action are required' });
        }

        const log = await prisma.cMSLog.create({
            data: {
                entryId,
                action, // Example: 'Created', 'Updated', 'Deleted'
                details: details || '', // Optional: Can include additional information
                performedByUserId: user.email, // Stores the user's email who performed the action
                performedBy: user.username || user.email, // Store username if available
                department: user.department, // Capture user department
                role: user.role, // Capture user role
                timestamp: new Date(), // Capture when the action was performed
            },
        });

        res.status(201).json({ success: true, message: 'Action logged successfully', data: log });
    } catch (error) {
        console.error('Error logging action:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ **Fetch All Logs**
exports.getCMSLogs = async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const { page = 1, limit = 100 } = req.query;
        const offset = (page - 1) * limit;

        const logs = await prisma.cMSLog.findMany({
            skip: offset,
            take: parseInt(limit),
            orderBy: { timestamp: 'desc' }, // Sort logs by newest first
        });

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Edit CMS Entry
exports.editCMSEntry = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        // Extract all fields from request body
        const {
            name, contact, email, branch, comfortableLanguage, assignedTo,
            collegeName, yearOfStudying, courseOpt, registeredMonth,
            projectedAmount, preRegisteredAmount
        } = req.body;

        const allowedRoles = ['Lead Generation', 'Executive', 'intern'];
        console.log("Checking against allowed roles:", allowedRoles);
        console.log("User role:", user.mainPosition);

        if (!allowedRoles.includes(user.mainPosition) && user.role !== 'Admin') {
            console.log("Access denied - user role not in allowed list");
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        // Ensure only Lead Generation, Executive, or Admin can edit the assignedTo field
        if (assignedTo && !(user.mainPosition === 'Lead Generation' || user.role === 'Admin' || user.mainPosition === 'Executive')) {
            return res.status(403).json({ success: false, message: 'Only Lead Generation, Executive, or Admin can edit the assignedTo field' });
        }

        // Parse numerical fields correctly
        const parsedProjectedAmount = projectedAmount ? parseFloat(projectedAmount) : 0;
        const parsedPreRegisteredAmount = preRegisteredAmount ? parseFloat(preRegisteredAmount) : 0;

        // Auto-calculate remainingAmount
        const remainingAmount = parsedProjectedAmount - parsedPreRegisteredAmount;

        // Update entry in the database
        const updatedEntry = await prisma.cMSEntry.update({
            where: { id },
            data: {
                name,
                contact,
                email,
                branch,
                comfortableLanguage,
                assignedTo,
                collegeName,
                yearOfStudying: yearOfStudying ? parseInt(yearOfStudying) : null,
                courseOpt,
                registeredMonth,
                projectedAmount: parsedProjectedAmount,
                preRegisteredAmount: parsedPreRegisteredAmount,
                remainingAmount // Auto-updated remainingAmount
            },
        });

        // Log the update action
        await prisma.cMSLog.create({
            data: {
                action: 'UPDATED',
                details: `Entry '${updatedEntry.name}' was updated by ${user.username || user.email}`,
                performedByUserId: user.email,
                performedBy: user.username || user.email,
                department: user.department,
                role: user.role,
                timestamp: new Date(),
            }
        });

        res.status(200).json({ success: true, data: updatedEntry });

    } catch (error) {
        console.error('Error updating CMS entry:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.deleteCMSEntry = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        // Check access control


        // Ensure only Lead Generation or Admin can delete the entry


        // Check if the entry exists
        const entry = await prisma.cMSEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        // Create the log entry without referencing the entryId
        await prisma.cMSLog.create({
            data: {
                action: 'DELETED',
                details: `Entry '${entry.name}' was deleted by ${user.username || user.email}`,
                performedByUserId: user.email,
                performedBy: user.username || user.email,
                department: user.department,
                role: user.role,
                timestamp: new Date(),
            }
        });

        // Delete the entry
        await prisma.cMSEntry.delete({
            where: { id },
        });

        res.status(200).json({ success: true, message: 'Entry deleted successfully, and log recorded.' });
    } catch (error) {
        console.error('Error deleting entry and logging:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getLeadGenAndExecutives = async (req, res) => {
    try {
        // Fetch users where mainPosition is 'Lead Generation' or 'Executive'
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { mainPosition: 'Lead Generation' },
                    { mainPosition: 'Executive' }
                ]
            },
            select: {
                employeeId: true,
                username: true,
                email: true,
                role: true,
                mainPosition: true,
                department: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' } // Sort by latest users first
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.getCMSCounts = async (req, res) => {
    try {
        const user = req.user;

        const allowedRoles = ['Lead Generation', 'Executive', 'intern'];
        console.log("Checking against allowed roles:", allowedRoles);
        console.log("User role:", user.mainPosition);

        if (!allowedRoles.includes(user.mainPosition) && user.role !== 'Admin') {
            console.log("Access denied - user role not in allowed list");
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        let filter = {};

        // If the user is an Executive, filter by assignedTo
        if (user.mainPosition === 'Executive') {
            filter = { assignedTo: user.email };
        }

        // Fetch count and financial data for different categories
        const [
            totalCompleted,
            activeContacts,
            pendingFollowUp,
            assignedLeads,
            totalLeads,
            totalProjectedAmount,
            totalPreRegisteredAmount,
            totalRemainingAmount
        ] = await Promise.all([
            prisma.cMSEntry.count({
                where: { ...filter, status: 'COMPLETE' }
            }),
            prisma.cMSEntry.count({
                where: { ...filter, status: { not: 'COMPLETE' } }
            }),
            prisma.cMSEntry.count({
                where: { ...filter, status: 'FOLLOW_UP' }
            }),
            prisma.cMSEntry.count({
                where: { assignedTo: user.email }
            }),
            prisma.cMSEntry.count({
                where: { ...filter }
            }),
            prisma.cMSEntry.aggregate({
                _sum: { projectedAmount: true },
                where: { ...filter }
            }),
            prisma.cMSEntry.aggregate({
                _sum: { preRegisteredAmount: true },
                where: { ...filter }
            }),
            prisma.cMSEntry.aggregate({
                _sum: { remainingAmount: true },
                where: { ...filter }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCompleted,
                activeContacts,
                pendingFollowUp,
                assignedLeads,
                totalLeads,
                financialData: {
                    totalProjectedAmount: totalProjectedAmount._sum.projectedAmount || 0,
                    totalPreRegisteredAmount: totalPreRegisteredAmount._sum.preRegisteredAmount || 0,
                    totalRemainingAmount: totalRemainingAmount._sum.remainingAmount || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching CMS counts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};





