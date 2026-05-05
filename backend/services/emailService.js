const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter for sending emails via SMTP
const transporter = nodemailer.createTransport({
  host: 'genzgifts.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'info@genzgifts.com',
    pass: 'y0L=b*NbN@Ic'
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send order confirmation email to customer when order is placed
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @param {string} orderNumber - Order number
 * @param {Array} items - Array of products in the order [{name, price, quantity}]
 * @param {object} shippingDetails - Shipping details {address, city, zip, country}
 * @param {number} subtotal - Order subtotal
 * @param {number} shippingCost - Shipping cost
 * @param {number} total - Order total
 * @param {string} couponCode - Coupon code used (optional)
 * @param {number} discountAmount - Discount amount applied (optional)
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
async function sendOrderConfirmationEmail(customerEmail, customerName, orderNumber, items, shippingDetails, subtotal, shippingCost, total, couponCode = null, discountAmount = 0) {
  try {
    // Create order items HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="font-weight: 500; color: #333;">${item.name}</div>
          <div style="font-size: 12px; color: #888;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">
          Rs. ${item.price.toLocaleString()}
        </td>
      </tr>
    `).join('');

    const trackOrderUrl = `https://genzgifts.com/track-order?order=${orderNumber}`;

    const mailOptions = {
      from: '"GenZGifts" <info@genzgifts.com>',
      to: customerEmail,
      subject: `Order Confirmed! #${orderNumber} - Thank you for your purchase!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b6b; margin: 0;">Thank You for Your Order! 🎉</h1>
            <p style="font-size: 18px;">Hi ${customerName},</p>
          </div>
          
          <p>Your order has been confirmed! We're processing your order and will ship it soon.</p>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> <span style="font-family: monospace; font-size: 16px;">${orderNumber}</span></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 12px; border-bottom: 2px solid #ff6b6b; color: #333;">Product</th>
                <th style="text-align: right; padding: 12px; border-bottom: 2px solid #ff6b6b; color: #333;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; color: #888;">Subtotal</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">Rs. ${subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; color: #888;">Shipping</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">${shippingCost === 0 ? 'Free' : 'Rs. ' + shippingCost.toLocaleString()}</td>
              </tr>
              ${couponCode && discountAmount > 0 ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; color: #28a745;">Discount (${couponCode})</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #28a745;">-Rs. ${discountAmount.toLocaleString()}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px; font-weight: bold; color: #333;">Total</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: #ff6b6b; font-size: 18px;">Rs. ${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
            <p style="margin: 5px 0;">${customerName}</p>
            <p style="margin: 5px 0;">${shippingDetails.address}</p>
            <p style="margin: 5px 0;">${shippingDetails.city}, ${shippingDetails.zip}</p>
            <p style="margin: 5px 0;">${shippingDetails.country}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackOrderUrl}" 
               style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Track Your Order
            </a>
            <p style="margin-top: 10px; font-size: 14px; color: #888;">Or copy this link: ${trackOrderUrl}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff5f5; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px;">Need help? Reply to this email or contact us on WhatsApp!</p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 14px;">
            <p>Thank you for shopping with <strong>GenZGifts</strong>!</p>
            <p>Follow us on Instagram: @genzgifts</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Send a review request email to customer after order is delivered
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @param {string} orderNumber - Order number
 * @param {Array} products - Array of products in the order [{id, name, image_url}]
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
async function sendReviewRequestEmail(customerEmail, customerName, orderNumber, products) {
  try {
    // Create product review links HTML
    const productsHtml = products.map(product => `
      <div style="margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <img src="${product.image_url}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">
        <h4 style="margin: 5px 0; color: #333;">${product.name}</h4>
        <a href="https://genzgifts.com?order=${orderNumber}&product=${product.id}" 
           style="display: inline-block; background: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Write a Review
        </a>
      </div>
    `).join('');

    const mailOptions = {
      from: '"GenZGifts" <info@genzgifts.com>',
      to: customerEmail,
      subject: `Your Order ${orderNumber} Has Been Delivered! Share Your Feedback`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b6b; margin: 0;">Thank You for Your Order! 🎉</h1>
            <p style="font-size: 18px;">Hi ${customerName},</p>
          </div>
          
          <p>Your order <strong>#${orderNumber}</strong> has been delivered successfully!</p>
          
          <p>We hope you love your purchases. We'd really appreciate it if you could take a moment to share your feedback by reviewing the products you ordered.</p>
          
          <h3 style="color: #333; margin-top: 30px;">Your Products:</h3>
          ${productsHtml}
          
          <div style="margin-top: 30px; padding: 20px; background: #fff5f5; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px;">Your reviews help us improve and help other customers make informed decisions!</p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 14px;">
            <p>Thank you for shopping with <strong>GenZGifts</strong>!</p>
            <p>Follow us on Instagram: @genzgifts</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Review request email sent successfully!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending review request email:', error);
    return false;
  }
}

/**
 * Send a test email to verify SMTP configuration
 * @returns {Promise<boolean>}
 */
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection error:', error);
    return false;
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  sendReviewRequestEmail,
  testEmailConnection
};
