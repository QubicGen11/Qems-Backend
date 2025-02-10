const { PrismaClient } = require('@prisma/client');
const excelToJson = require('convert-excel-to-json');
const multer = require('multer');
const fs = require('fs');
const prisma = new PrismaClient();

// Middleware to check access
const checkAccess = (user, requiredDepartments, requiredPositions) => {
    return requiredDepartments.includes(user.department) && requiredPositions.includes(user.mainPosition);
};

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }).single('file'); // Expecting a file input named "file"

exports.createCMSEntry = async (req, res) => {
    try {
        const user = req.user;
        console.log("User:", user);

        // Ensure only Lead Generation or Admin can create a CMS entry
        if (!(user.mainPosition === 'Lead Generation' || user.role === 'Admin')) {
            return res.status(403).json({ success: false, message: 'Only Lead Generation or Admin can create a CMS entry' });
        }

        if (!checkAccess(user, ['Product Management'], ['Admin', 'Lead Generation', 'Executive', 'intern'])) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const { name, contact, email, branch, comfortableLanguage, assignedTo } = req.body;

        if (!name || !contact || !email || !branch || !comfortableLanguage || !assignedTo) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if contact already exists
        const existingEntry = await prisma.cMSEntry.findFirst({
            where: { OR: [{ email }, { contact }] }
        });

        if (existingEntry) {
            return res.status(409).json({ success: false, message: 'Contact already exists' });
        }

        const newEntry = await prisma.cMSEntry.create({
            data: {
                name,
                contact,
                email,
                branch,
                comfortableLanguage,
                createdByUserId: user.email,
                assignedTo
            }
        });

        // Log the creation action
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

        return res.status(201).json({ success: true, message: "Contact created successfully", data: newEntry });
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
            if (!checkAccess(user, ['Product Management'], ['Admin', 'Lead Generation', 'Executive', 'intern'])) {
                return res.status(403).json({ success: false, message: 'Access Denied' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            console.log('Processing Excel file:', req.file.path);

            const excelData = excelToJson({
                sourceFile: req.file.path,
                header: { rows: 1 },
                columnToKey: { A: 'name', B: 'contact', C: 'email', D: 'branch', E: 'comfortableLanguage' }
            });

            console.log('Excel data:', excelData);

            const validEntries = [];
            const invalidEntries = [];
            const seenContacts = new Set();
            const seenEmails = new Set();

            for (const entry of excelData.Sheet1) {
                if (!entry.name || !entry.contact || !entry.email || !entry.branch || !entry.comfortableLanguage) {
                    invalidEntries.push({ ...entry, reason: "Missing required fields" });
                    continue;
                }

                if (seenContacts.has(entry.contact) || seenEmails.has(entry.email)) {
                    invalidEntries.push({ ...entry, reason: "Duplicate entry in Excel file" });
                    continue;
                }
                seenContacts.add(entry.contact);
                seenEmails.add(entry.email);

                const existingEntry = await prisma.cMSEntry.findFirst({
                    where: { OR: [{ email: entry.email }, { contact: entry.contact }] }
                });

                if (existingEntry) {
                    invalidEntries.push({ ...entry, reason: "Duplicate entry in database" });
                } else {
                    validEntries.push(entry);
                }
            }

            console.log('Validation Summary:', { validEntries, invalidEntries });

            fs.unlinkSync(req.file.path); // Delete file after processing

            // **🚀 Check query param importData=true to insert into DB**
            if (req.query.importData === 'true' && validEntries.length > 0) {
                const importedEntries = [];

                for (const entry of validEntries) {
                    const newEntry = await prisma.cMSEntry.create({
                        data: {
                            ...entry,
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

            // **🚀 Just validate if importData=false**
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
            },
        });

        // Log the comment action
        await prisma.cMSLog.create({
            data: {
                action: 'COMMENT_ADDED',
                details: `Comment added to entry '${entryId}' by ${user.username || user.email}`,
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
  
      console.log("Entry id is "  + entryId);
  
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

        if (!(user.mainPosition === 'Executive' || user.mainPosition === 'Lead Generation' || user.role === 'Admin')) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const { id } = req.params;
        const { callStatus, status } = req.body;

        // Check if the entry exists
        const entry = await prisma.cMSEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        // Ensure only the assigned executive can update the entry
        if (entry.assignedTo !== user.email && user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const updatedEntry = await prisma.cMSEntry.update({
            where: { id },
            data: { callStatus, status },
        });

        // Log the update action
        await prisma.cMSLog.create({
            data: {
                action: 'UPDATED',
                details: `Entry '${updatedEntry.name}' status was updated by ${user.username || user.email}`,
                performedByUserId: user.email,
                performedBy: user.username || user.email,
                department: user.department,
                role: user.role,
                timestamp: new Date(),
            }
        });

        res.status(200).json({ success: true, data: updatedEntry });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get All CMS Entries
// ✅ **Fetch All CMS Entries**
exports.getAllCMSEntries = async (req, res) => {
    try {
        const user = req.user;

        if (!checkAccess(user, ['Product Management'], ['Lead Generation', 'Executive', 'Admin', 'intern'])) {
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

        if (!checkAccess(user, ['Product Management'], ['Lead Generation', 'Executive', 'Admin', 'intern'])) {
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
        const { name, contact, email, branch, comfortableLanguage, assignedTo } = req.body;

        if (!checkAccess(user, ['Product Management'], ['Admin', 'Lead Generation', 'Executive', 'intern'])) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        // Ensure only Lead Generation or Admin can edit the assignedTo field
        if (assignedTo && !(user.mainPosition === 'Lead Generation' || user.role === 'Admin')) {
            return res.status(403).json({ success: false, message: 'Only Lead Generation or Admin can edit the assignedTo field' });
        }

        const updatedEntry = await prisma.cMSEntry.update({
            where: { id },
            data: { name, contact, email, branch, comfortableLanguage, ...(assignedTo && { assignedTo }) },
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
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteCMSEntry = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        // Check access control
        if (!checkAccess(user, ['Product Management'], ['Admin', 'Lead Generation', 'Executive', 'intern'])) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        // Ensure only Lead Generation or Admin can delete the entry
        if (!(user.mainPosition === 'Lead Generation' || user.role === 'Admin')) {
            return res.status(403).json({ success: false, message: 'Only Lead Generation or Admin can delete the entry' });
        }

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
  



