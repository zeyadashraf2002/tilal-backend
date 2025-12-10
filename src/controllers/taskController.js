// backend/src/controllers/taskController.js - ✅ UPDATED
import Task from "../models/Task.js";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Site from "../models/Site.js";
import Inventory from "../models/Inventory.js";
import {
  notifyTaskAssignment,
  notifyTaskCompletion,
} from "../services/notificationService.js";
import mongoose from "mongoose";

/**
 * @desc    Get all tasks
 * @route   GET /api/v1/tasks
 * @access  Private
 */
export const getTasks = async (req, res) => {
  try {
    const {
      status,
      worker,
      client,
      site,
      section,
      branch,
      priority,
      category,
    } = req.query;

    let query = {};

    if (req.user.role === "worker") {
      query.worker = req.user.id;
    }

    if (status) query.status = status;
    if (worker) query.worker = worker;
    if (client) query.client = client;
    if (site) query.site = site;
    if (section) query.section = section; // ✅ Added
    if (branch) query.branch = branch;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tasks = await Task.find(query)
      .populate("client", "name email phone address")
      .populate("worker", "name email phone")
      .populate("branch", "name code")
      .populate("site", "name siteType totalArea")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("client", "name email phone address whatsapp")
      .populate("worker", "name email phone workerDetails")
      .populate("branch", "name code address")
      .populate({
        path: "site",
        select: "name description siteType sections coverImage",
        populate: {
          path: "client",
          select: "name email phone",
        },
      })
      .populate("materials.item", "name sku unit")
      .populate("adminReview.reviewedBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin") {
      if (!task.worker || task.worker._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this task",
        });
      }
    }

    // ✅ Get reference images from the specific section
    let referenceImages = [];
    if (task.site && task.section) {
      const site = await Site.findById(task.site);
      if (site) {
        const section = site.sections.id(task.section);
        if (section && section.referenceImages) {
          referenceImages = section.referenceImages;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...task.toObject(),
        referenceImages, // ✅ Add reference images to response
      },
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/v1/tasks
 * @access  Private/Admin
 */
export const createTask = async (req, res) => {
  try {
    const taskData = req.body;

    // ✅ Validation: Site is required
    if (!taskData.site) {
      return res.status(400).json({
        success: false,
        message: "Site is required",
      });
    }

    // ✅ Validation: Section is required
    if (!taskData.section) {
      return res.status(400).json({
        success: false,
        message: "Section is required",
      });
    }

    // ✅ Verify Site exists
    const site = await Site.findById(taskData.site);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    // ✅ Verify Section exists in Site
    const section = site.sections.id(taskData.section);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found in this site",
      });
    }

    // ✅ Auto-fill Client from Site
    if (!taskData.client) {
      taskData.client = site.client;
    }

    // ✅ Validate Client ID
    if (!mongoose.Types.ObjectId.isValid(taskData.client)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }
    // Auto-fill branch from site
    if (!taskData.branch && site.branch?._id) {
      taskData.branch = site.branch._id;
    }

    const task = await Task.create(taskData);

    // ✅ Populate full data
    const populatedTask = await Task.findById(task._id)
      .populate("client", "name email phone")
      .populate("worker", "name email")
      .populate("branch", "name code")
      .populate("site", "name siteType");

    // Update client total tasks
    if (task.client) {
      await Client.findByIdAndUpdate(task.client, {
        $inc: { totalTasks: 1 },
      });
    }

    // ✅ Update site total tasks
    await Site.findByIdAndUpdate(task.site, {
      $inc: { totalTasks: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};


/**
 * @desc    Toggle image visibility to client
 * @route   PUT /api/v1/tasks/:id/images/:imageId/visibility
 * @access  Private (Admin only)
 */
export const toggleImageVisibility = async (req, res) => {
  try {
    const { imageType } = req.body; // 'before' or 'after'
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the image in the specified type array
    const imageArray = task.images[imageType];
    
    if (!imageArray) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type'
      });
    }

    const imageIndex = imageArray.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Toggle visibility
    imageArray[imageIndex].isVisibleToClient = !imageArray[imageIndex].isVisibleToClient;
    
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Image visibility updated successfully',
      data: {
        imageId: req.params.imageId,
        isVisibleToClient: imageArray[imageIndex].isVisibleToClient
      }
    });
  } catch (error) {
    console.error('Toggle image visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image visibility',
      error: error.message
    });
  }
};

/**
 * @desc    Update multiple images visibility at once
 * @route   PUT /api/v1/tasks/:id/images/bulk-visibility
 * @access  Private (Admin only)
 */
export const bulkUpdateImageVisibility = async (req, res) => {
  try {
    const { imageIds, imageType, isVisible } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const imageArray = task.images[imageType];
    
    if (!imageArray) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type'
      });
    }

    // Update visibility for all specified images
    let updatedCount = 0;
    imageArray.forEach(img => {
      if (imageIds.includes(img._id.toString())) {
        img.isVisibleToClient = isVisible;
        updatedCount++;
      }
    });

    await task.save();

    res.status(200).json({
      success: true,
      message: `${updatedCount} image(s) visibility updated successfully`,
      data: {
        updatedCount,
        isVisible
      }
    });
  } catch (error) {
    console.error('Bulk update image visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update images visibility',
      error: error.message
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (req.user.role === "worker" && task.worker?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // If assigning worker, deduct materials
    if (req.body.worker && !task.worker) {
      if (task.materials && task.materials.length > 0) {
        for (const material of task.materials) {
          if (material.item) {
            const inventoryItem = await Inventory.findById(material.item);
            if (inventoryItem) {
              await inventoryItem.deduct(material.quantity);
            }
          }
        }
      }
      req.body.status = "assigned";
    }

    // If marking as completed
    if (req.body.status === "completed" && task.status !== "completed") {
      req.body.completedAt = new Date();

      // Update client completed tasks
      await Client.findByIdAndUpdate(task.client, {
        $inc: { completedTasks: 1 },
      });

      // Update worker completed tasks
      if (task.worker) {
        await User.findByIdAndUpdate(task.worker, {
          $inc: { "workerDetails.completedTasks": 1 },
        });
      }

      // ✅ Update site completed tasks
      if (task.site) {
        await Site.findByIdAndUpdate(task.site, {
          $inc: { completedTasks: 1 },
          lastVisit: new Date(),
        });
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("client", "name email phone")
      .populate("worker", "name email phone")
      .populate("branch", "name code")
      .populate("site", "name siteType");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private/Admin
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Start task (worker)
 * @route   POST /api/v1/tasks/:id/start
 * @access  Private/Worker
 */
export const startTask = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.worker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    task.status = "in-progress";
    task.startedAt = new Date();
    task.startLocation = {
      coordinates: { latitude, longitude },
      timestamp: new Date(),
    };

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task started successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Complete task (worker)
 * @route   POST /api/v1/tasks/:id/complete
 * @access  Private/Worker
 */
export const completeTask = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.worker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    task.status = "completed";
    task.completedAt = new Date();
    task.endLocation = {
      coordinates: { latitude, longitude },
      timestamp: new Date(),
    };

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task completed successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload task images (before/after only)
 * @route   POST /api/v1/tasks/:id/images
 * @access  Private (Worker/Admin)
 */
export const uploadTaskImages = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (req.user.role === "worker" && task.worker?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to upload images for this task",
      });
    }

    const { imageType, isVisibleToClient = true } = req.body;

    // ✅ Only before/after allowed now (no reference)
    if (!["before", "after"].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type. Must be: before or after",
      });
    }

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const imageObjects = files.map((file) => ({
      url: file.url,
      cloudinaryId: file.cloudinaryId,
      thumbnail: file.url,
      uploadedAt: new Date(),
      uploadedBy: req.user.id,
      isVisibleToClient:
        isVisibleToClient === "true" || isVisibleToClient === true,
    }));

    if (!task.images) {
      task.images = { before: [], after: [] };
    }

    task.images[imageType].push(...imageObjects);
    await task.save();

    console.log(`✅ ${files.length} ${imageType} images uploaded successfully`);

    res.status(200).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      data: task.images,
    });
  } catch (error) {
    console.error("Upload task images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete task image
 * @route   DELETE /api/v1/tasks/:id/images/:imageId
 * @access  Private (Worker/Admin)
 */
export const deleteTaskImage = async (req, res) => {
  try {
    const { imageType } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (req.user.role === "worker" && task.worker?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!["before", "after"].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type",
      });
    }

    // Find and remove image
    const imageArray = task.images[imageType];
    const imageIndex = imageArray.findIndex(
      (img) => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const image = imageArray[imageIndex];

    // Delete from Cloudinary
    if (image.cloudinaryId) {
      try {
        const { v2: cloudinary } = await import("cloudinary");
        await cloudinary.uploader.destroy(image.cloudinaryId);
        console.log("🗑️ Image deleted from Cloudinary");
      } catch (err) {
        console.error("Failed to delete from Cloudinary:", err);
      }
    }

    // Remove from array
    imageArray.splice(imageIndex, 1);
    await task.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete task image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

/**
 * @desc    Assign task to worker
 * @route   POST /api/v1/tasks/:id/assign
 * @access  Private (Admin)
 */
export const assignTask = async (req, res) => {
  try {
    const { workerId } = req.body;

    const task = await Task.findById(req.params.id).populate(
      "client",
      "name email phone"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    task.worker = workerId;
    task.status = "assigned";
    await task.save();

    // Send notification
    await notifyTaskAssignment(worker, task, task.client);

    res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data: task,
    });
  } catch (error) {
    console.error("Assign task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign task",
      error: error.message,
    });
  }
};
/**
 * @desc    Submit client feedback for completed task
 * @route   POST /api/v1/tasks/:id/feedback
 * @access  Private (Client only)
 */
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment, imageNumber } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task is completed
    if (task.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only provide feedback for completed tasks'
      });
    }

    // Check authorization (client can only feedback their own tasks)
    if (req.user.role === 'client' && task.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to feedback this task'
      });
    }

    // Prepare feedback data
    const feedbackData = {
      rating: parseInt(rating),
      comment: comment || '',
      imageNumber: imageNumber ? parseInt(imageNumber) : null,
      submittedAt: new Date()
    };

    // Add feedback image if uploaded
    if (req.file && req.file.cloudinaryUrl) {
      feedbackData.image = req.file.cloudinaryUrl;
      feedbackData.cloudinaryId = req.file.cloudinaryId;
    }

    // Update task with feedback
    task.feedback = feedbackData;
    await task.save();

    // TODO: Send notification to admin about new feedback
    // await notifyAdminAboutFeedback(task, feedbackData);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: task.feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};
export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
  uploadTaskImages,
  deleteTaskImage,
  assignTask,
  toggleImageVisibility,
  bulkUpdateImageVisibility,
    submitFeedback      
};
