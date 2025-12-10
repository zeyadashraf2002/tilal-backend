import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate invoice PDF
 * @param {object} invoice - Invoice data
 * @param {object} task - Task data
 * @param {object} client - Client data
 * @param {Array} selectedImages - Selected images to include
 * @returns {Promise<string>} - Path to generated PDF
 */
export const generateInvoicePDF = async (invoice, task, client, selectedImages = []) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      // Generate filename
      const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../uploads/invoices', filename);

      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Pipe PDF to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add content to PDF
      addInvoiceHeader(doc, invoice);
      addClientInfo(doc, client);
      addTaskDetails(doc, task);
      addCostBreakdown(doc, invoice, task);
      
      // Add images if provided
      if (selectedImages && selectedImages.length > 0) {
        addImages(doc, selectedImages);
      }

      addFooter(doc, invoice);

      // Finalize PDF
      doc.end();

      // Wait for stream to finish
      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add invoice header
 */
const addInvoiceHeader = (doc, invoice) => {
  doc
    .fontSize(20)
    .text('INVOICE', 50, 50, { align: 'center' })
    .fontSize(10)
    .text(`Invoice #: ${invoice.invoiceNumber}`, 50, 80)
    .text(`Date: ${new Date(invoice.issuedDate).toLocaleDateString()}`, 50, 95)
    .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 110)
    .moveDown();
};

/**
 * Add client information
 */
const addClientInfo = (doc, client) => {
  doc
    .fontSize(12)
    .text('Bill To:', 50, 140)
    .fontSize(10)
    .text(client.name, 50, 160)
    .text(client.email, 50, 175)
    .text(client.phone, 50, 190);

  if (client.address) {
    const address = `${client.address.street || ''}, ${client.address.city || ''}, ${client.address.state || ''}`;
    doc.text(address, 50, 205);
  }

  doc.moveDown(2);
};

/**
 * Add task details
 */
const addTaskDetails = (doc, task) => {
  const y = 250;

  doc
    .fontSize(12)
    .text('Service Details:', 50, y)
    .fontSize(10)
    .text(`Task: ${task.title}`, 50, y + 20)
    .text(`Description: ${task.description}`, 50, y + 35, { width: 500 })
    .text(`Category: ${task.category}`, 50, y + 65)
    .text(`Status: ${task.status}`, 50, y + 80)
    .text(`Scheduled Date: ${new Date(task.scheduledDate).toLocaleDateString()}`, 50, y + 95);

  if (task.completedAt) {
    doc.text(`Completed Date: ${new Date(task.completedAt).toLocaleDateString()}`, 50, y + 110);
  }

  doc.moveDown(2);
};

/**
 * Add cost breakdown
 */
const addCostBreakdown = (doc, invoice, task) => {
  const y = 400;

  // Table header
  doc
    .fontSize(12)
    .text('Cost Breakdown:', 50, y)
    .moveDown(0.5);

  // Draw table
  const tableTop = y + 30;
  const itemX = 50;
  const descX = 200;
  const amountX = 450;

  // Header
  doc
    .fontSize(10)
    .text('Item', itemX, tableTop, { bold: true })
    .text('Description', descX, tableTop)
    .text('Amount', amountX, tableTop);

  // Line
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  let currentY = tableTop + 25;

  // Labor cost
  doc
    .text('Labor', itemX, currentY)
    .text('Service labor cost', descX, currentY)
    .text(`$${task.cost?.labor || 0}`, amountX, currentY);

  currentY += 20;

  // Materials cost
  doc
    .text('Materials', itemX, currentY)
    .text('Materials used', descX, currentY)
    .text(`$${task.cost?.materials || 0}`, amountX, currentY);

  currentY += 20;

  // Line
  doc
    .moveTo(50, currentY + 5)
    .lineTo(550, currentY + 5)
    .stroke();

  currentY += 15;

  // Total
  doc
    .fontSize(12)
    .text('Total Amount:', descX, currentY, { bold: true })
    .text(`$${invoice.totalAmount}`, amountX, currentY);

  currentY += 25;

  // Payment status
  doc
    .fontSize(10)
    .text(`Payment Status: ${invoice.paymentStatus}`, itemX, currentY)
    .text(`Payment Method: ${invoice.paymentMethod || 'N/A'}`, itemX, currentY + 15);
};

/**
 * Add images to PDF
 */
const addImages = (doc, images) => {
  doc.addPage();

  doc
    .fontSize(14)
    .text('Service Images', 50, 50, { align: 'center' })
    .moveDown();

  let y = 100;
  let x = 50;
  const imageWidth = 240;
  const imageHeight = 180;
  const margin = 20;

  images.forEach((image, index) => {
    try {
      const imagePath = path.join(__dirname, '../../uploads', image.url);

      if (fs.existsSync(imagePath)) {
        // Add image
        doc.image(imagePath, x, y, {
          width: imageWidth,
          height: imageHeight,
          fit: [imageWidth, imageHeight],
          align: 'center'
        });

        // Add caption
        doc
          .fontSize(8)
          .text(image.caption || `Image ${index + 1}`, x, y + imageHeight + 5, {
            width: imageWidth,
            align: 'center'
          });

        // Move to next position
        if ((index + 1) % 2 === 0) {
          // Move to next row
          x = 50;
          y += imageHeight + margin + 30;

          // Add new page if needed
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
        } else {
          // Move to next column
          x += imageWidth + margin;
        }
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  });
};

/**
 * Add footer
 */
const addFooter = (doc, invoice) => {
  const bottomY = 750;

  doc
    .fontSize(8)
    .text('Thank you for your business!', 50, bottomY, { align: 'center' })
    .text('For any questions, please contact us.', 50, bottomY + 15, { align: 'center' })
    .text(`Generated on ${new Date().toLocaleString()}`, 50, bottomY + 30, { align: 'center' });
};

/**
 * Delete PDF file
 */
export const deletePDF = async (pdfPath) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads/invoices', pdfPath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }
};

export default {
  generateInvoicePDF,
  deletePDF
};

