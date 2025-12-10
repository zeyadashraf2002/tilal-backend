import Client from '../models/Client.js';
import Task from '../models/Task.js';
import { generateToken } from '../utils/jwt.js';
import crypto from 'crypto';
import { notifyClientCredentials } from '../services/notificationService.js';

/**
 * ✅ UNIFIED: Client login using standard JWT
 * @desc    Client login
 * @route   POST /api/v1/clients/login
 * @access  Public
 */
export const clientLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Find client by username or email
    const client = await Client.findOne({
      $or: [
        { username: username || email },
        { email: email || username }
      ]
    }).select('+password');

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if client is active
    if (client.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is not active. Please contact support.'
      });
    }

    // Check if client has password set
    if (!client.password) {
      return res.status(401).json({
        success: false,
        message: 'Please contact admin to set up your account'
      });
    }

    // Check password
    const isMatch = await client.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ✅ UNIFIED: Generate token with role='client'
    const token = generateToken(client._id, 'client');

    // Get public profile
    const clientData = client.getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        client: clientData,
        user: { ...clientData, role: 'client' }, // ✅ Add unified user object
        isPasswordTemporary: client.isPasswordTemporary
      }
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get all clients
 * @route   GET /api/v1/clients
 * @access  Private (Admin only)
 */
export const getClients = async (req, res) => {
  try {
    const {
      status,
      branch,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (branch) {
      query.branch = branch;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .populate('branch', 'name address')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      count: clients.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

/**
 * @desc    Get single client
 * @route   GET /api/v1/clients/:id
 * @access  Private
 */
export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('branch', 'name address phone');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
};

/**
 * @desc    Create new client
 * @route   POST /api/v1/clients
 * @access  Private (Admin only)
 */
export const createClient = async (req, res) => {
  try {
    const clientData = req.body;

    // ✅ Generate username if not provided
    if (!clientData.username) {
      const randomStr = crypto.randomBytes(4).toString('hex');
      clientData.username = `client_${randomStr}`;
    }

    // ✅ Generate temporary password if not provided
    let tempPassword = null;
    if (!clientData.password) {
      tempPassword = crypto.randomBytes(8).toString('hex');
      clientData.password = tempPassword;
      clientData.isPasswordTemporary = true;
    } else {
      clientData.isPasswordTemporary = false;
    }

    const client = await Client.create(clientData);

    // ✅ Send credentials notification if temporary password was generated
    if (tempPassword) {
      await notifyClientCredentials(client, clientData.username, tempPassword);
    }

    // Get public profile
    const clientProfile = client.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: {
        client: clientProfile,
        temporaryPassword: tempPassword || undefined
      }
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
};

/**
 * @desc    Update client
 * @route   PUT /api/v1/clients/:id
 * @access  Private (Admin or Client themselves)
 */
export const updateClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // ✅ UNIFIED: Check authorization using req.user.role
    if (req.user.role === 'client' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this client'
      });
    }

    const updateData = req.body;

    // If password is being updated, mark as not temporary
    if (updateData.password) {
      updateData.isPasswordTemporary = false;
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client.getPublicProfile()
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
};

/**
 * @desc    Delete client
 * @route   DELETE /api/v1/clients/:id
 * @access  Private (Admin only)
 */
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
};

/**
 * @desc    Get client tasks
 * @route   GET /api/v1/clients/:id/tasks
 * @access  Private (Admin or Client themselves)
 */
export const getClientTasks = async (req, res) => {
  try {
    // ✅ UNIFIED: Check authorization
    if (req.user.role === 'client' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these tasks'
      });
    }

    const tasks = await Task.find({ client: req.params.id })
      .populate('worker', 'name email phone')
      .populate('branch', 'name')
      .populate('site', 'name siteType')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get client tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client tasks',
      error: error.message
    });
  }
};

export default {
  clientLogin,
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientTasks
};