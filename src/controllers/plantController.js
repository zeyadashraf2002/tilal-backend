// backend/src/controllers/plantController.js - Fixed with Cloudinary
import Plant from '../models/Plant.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * @desc    Get all plants
 * @route   GET /api/v1/plants
 * @access  Public
 */
export const getPlants = async (req, res) => {
  try {
    const {
      category,
      isActive,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.bn': { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } }
      ];
    }

    const plants = await Plant.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Plant.countDocuments(query);

    res.status(200).json({
      success: true,
      count: plants.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: plants
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plants',
      error: error.message
    });
  }
};

/**
 * @desc    Get single plant
 * @route   GET /api/v1/plants/:id
 * @access  Public
 */
export const getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plant',
      error: error.message
    });
  }
};

/**
 * @desc    Create new plant
 * @route   POST /api/v1/plants
 * @access  Private (Admin only)
 */
export const createPlant = async (req, res) => {
  try {
    const plantData = req.body;

    // ✅ Handle Cloudinary image
    if (req.file && req.file.cloudinaryUrl) {
      plantData.image = req.file.cloudinaryUrl;
      plantData.cloudinaryId = req.file.cloudinaryId;
    }

    const plant = await Plant.create(plantData);

    res.status(201).json({
      success: true,
      message: 'Plant created successfully',
      data: plant
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create plant',
      error: error.message
    });
  }
};

/**
 * @desc    Update plant
 * @route   PUT /api/v1/plants/:id
 * @access  Private (Admin only)
 */
export const updatePlant = async (req, res) => {
  try {
    let plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const updateData = req.body;

    // ✅ Handle new Cloudinary image
    if (req.file && req.file.cloudinaryUrl) {
      // Delete old image from Cloudinary
      if (plant.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(plant.cloudinaryId);
          console.log('🗑️ Old image deleted from Cloudinary');
        } catch (err) {
          console.error('Failed to delete old image:', err);
        }
      }
      
      updateData.image = req.file.cloudinaryUrl;
      updateData.cloudinaryId = req.file.cloudinaryId;
    }

    plant = await Plant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Plant updated successfully',
      data: plant
    });
  } catch (error) {
    console.error('Update plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plant',
      error: error.message
    });
  }
};

/**
 * @desc    Delete plant
 * @route   DELETE /api/v1/plants/:id
 * @access  Private (Admin only)
 */
export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // ✅ Delete image from Cloudinary
    if (plant.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(plant.cloudinaryId);
        console.log('🗑️ Image deleted from Cloudinary');
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
    }

    await plant.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    console.error('Delete plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plant',
      error: error.message
    });
  }
};

/**
 * @desc    Get plant categories
 * @route   GET /api/v1/plants/categories
 * @access  Public
 */
export const getPlantCategories = async (req, res) => {
  try {
    const categories = await Plant.distinct('category');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

export default {
  getPlants,
  getPlant,
  createPlant,
  updatePlant,
  deletePlant,
  getPlantCategories
};