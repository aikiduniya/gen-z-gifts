const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db');
const emailService = require('../services/emailService');

// Initialize Stripe - will throw error if STRIPE_SECRET_KEY is not set
// Make sure to set STRIPE_SECRET_KEY in your .env file
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('Stripe initialization failed:', error.message);
}

// POST /checkout/create-session
// Creates a Stripe Checkout session and returns the URL + creates order entry
router.post('/checkout/create-session', async (req, res) => {
  try {
    const { 
      items, 
      customerEmail, 
      customerName, 
      customerPhone, 
      shippingAddress, 
      shippingCity, 
      shippingZip, 
      shippingCountry,
      shippingCost,
      couponCode,
      discountAmount
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }
    if (!customerEmail || !customerName || !customerPhone || !shippingAddress || !shippingCity || !shippingZip || !shippingCountry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured.' });
    }

    // Calculate order totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_cost = shippingCost || (subtotal >= 5000 ? 0 : 99);
    const discount = discountAmount || 0;
    const total = subtotal + shipping_cost - discount;

    // Create order in database first
    const orderNumber = 'ORD-' + Date.now();
    const orderId = crypto.randomUUID();

    // Insert order into orders table
    await pool.execute(
      'INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, shipping_country, subtotal, shipping_cost, discount_amount, coupon_code, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, orderNumber, customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingZip, shippingCountry, subtotal, shipping_cost, discount, couponCode || null, total, 'pending']
    );

    // Insert order items
    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.price, item.quantity]
      );
    }

    // Transform items to Stripe line items format
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping cost as a line item if > 0
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8082'}/order-confirmation/${orderNumber}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8082'}/checkout`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
        orderNumber: orderNumber,
        customerName: customerName || '',
      },
      // Note: Webhook URL is configured in Stripe Dashboard, not here
      // Go to Stripe Dashboard > Webhooks to add your endpoint
    });

    // Update order with stripe payment id
    await pool.execute(
      'UPDATE orders SET stripe_payment_id = ? WHERE id = ?',
      [session.id, orderId]
    );

    // Send order confirmation email (async, don't wait)
    const orderItems = items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    const shippingDetails = {
      address: shippingAddress,
      city: shippingCity,
      zip: shippingZip,
      country: shippingCountry
    };
    
    emailService.sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      orderNumber,
      orderItems,
      shippingDetails,
      subtotal,
      shipping_cost,
      total,
      couponCode || null,
      discount
    ).then(success => {
      if (success) {
        console.log(`Order confirmation email sent for order ${orderNumber}`);
      }
    }).catch(emailError => {
      console.error('Error sending order confirmation email:', emailError);
    });

    // Return both the Stripe URL and order info
    res.json({ 
      url: session.url,
      orderId: orderId,
      orderNumber: orderNumber
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

module.exports = router;
