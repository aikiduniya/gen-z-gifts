const express = require('express');
const router = express.Router();
const pool = require('../db');

// Initialize Stripe
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('Stripe initialization failed:', error.message);
}

// Stripe webhook endpoint
// IMPORTANT: This route must be defined BEFORE express.json() middleware in server.js
// because Stripe needs the raw body for signature verification
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Get the order ID from metadata
      const orderId = session.metadata.orderId;
      const orderNumber = session.metadata.orderNumber;
      
      if (orderId) {
        try {
          // Update order status to 'paid' and store payment details
          await pool.execute(
            'UPDATE orders SET status = ?, stripe_payment_id = ?, payment_status = ?, paid_at = NOW() WHERE id = ?',
            ['paid', session.payment_intent, 'paid', orderId]
          );
          
          console.log(`Order ${orderNumber} (${orderId}) marked as paid. Payment intent: ${session.payment_intent}`);
        } catch (dbError) {
          console.error('Error updating order status:', dbError);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Optionally update order status to 'payment_failed'
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;
