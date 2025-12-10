import Invoice from '../models/Invoice.js';
import Task from '../models/Task.js';
import Client from '../models/Client.js';
import { generateInvoicePDF } from '../services/pdfService.js';

/**
 * @desc    Get all invoices
 * @route   GET /api/v1/invoices
 * @access  Private (Admin)
 */
export const getInvoices = async (req, res) => {
  try {
    const {
      client,
      status,
      paymentStatus,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (client) {
      query.client = client;
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const invoices = await Invoice.find(query)
      .populate('client', 'name email phone')
      .populate('task', 'title status')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

/**
 * @desc    Get single invoice
 * @route   GET /api/v1/invoices/:id
 * @access  Private
 */
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('task', 'title description category status cost images');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Create invoice
 * @route   POST /api/v1/invoices
 * @access  Private (Admin)
 */
export const createInvoice = async (req, res) => {
  try {
    const { task: taskId, selectedImages } = req.body;

    const task = await Task.findById(taskId)
      .populate('client')
      .populate('worker', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${Date.now()}-${count + 1}`;

    const totalAmount = task.cost?.total || 0;

    const invoiceData = {
      ...req.body,
      invoiceNumber,
      client: task.client._id,
      task: taskId,
      totalAmount
    };

    const invoice = await Invoice.create(invoiceData);

    const pdfPath = await generateInvoicePDF(
      invoice,
      task,
      task.client,
      selectedImages || []
    );

    invoice.pdfUrl = pdfPath.replace(/\\/g, '/').split('uploads/')[1];
    await invoice.save();

    task.invoice = invoice._id;
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Update invoice
 * @route   PUT /api/v1/invoices/:id
 * @access  Private (Admin)
 */
export const updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id)
      .populate('task')
      .populate('client');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const { selectedImages, regeneratePDF } = req.body;

    invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('task').populate('client');

    if (regeneratePDF) {
      const task = await Task.findById(invoice.task._id);
      
      const pdfPath = await generateInvoicePDF(
        invoice,
        task,
        invoice.client,
        selectedImages || []
      );

      invoice.pdfUrl = pdfPath.replace(/\\/g, '/').split('uploads/')[1];
      await invoice.save();
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Delete invoice
 * @route   DELETE /api/v1/invoices/:id
 * @access  Private (Admin)
 */
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/v1/invoices/:id/payment-status
 * @access  Private (Admin)
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paidAmount, paymentDate } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    invoice.paymentStatus = paymentStatus;
    
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    if (paidAmount !== undefined) {
      invoice.paidAmount = paidAmount;
    }

    if (paymentDate) {
      invoice.paidAt = paymentDate;
    }

    if (paymentStatus === 'paid') {
      const client = await Client.findById(invoice.client);
      if (client) {
        client.paymentStatus = 'paid';
        client.lastPaymentDate = new Date();
        await client.save();
      }
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

export default {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus
};