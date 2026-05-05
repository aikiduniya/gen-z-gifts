

# GenZGifts — Gift Store Website

## Branding
- **Logo**: Your uploaded GenZGifts logo displayed in the header
- **Color theme**: Purple-to-pink gradient matching the logo, with a modern Gen-Z aesthetic
- **Domain**: genzgifts.com (can be connected after publishing)

---

## 1. Customer-Facing Storefront (Single Page)

### Header
- Logo + "GenZGifts" branding
- Navigation links (Shop, About, Contact)
- Cart icon with item count badge

### Hero Banner (Short)
- Compact, eye-catching banner with a tagline like "Gifts That Hit Different ⚡"
- Gradient background matching the brand colors
- "Shop Now" CTA button

### Gift Categories / Featured Gifts Section
- Grid of gift cards showing image, name, price
- Filter/sort options (by category, price)
- Click to open gift detail view

### Footer
- Contact info, social links, copyright

---

## 2. Gift Detail Page
- Large product images
- Name, description, price
- Quantity selector
- "Add to Cart" button
- Related gifts section

---

## 3. Cart & Checkout Flow
- Slide-out cart drawer showing added items
- Checkout page with:
  - Shipping details form (name, address, phone, email) — guest checkout, no account needed
  - Order summary
  - **Stripe payment integration** for secure card payments
- Order confirmation page with order number

---

## 4. Admin Dashboard (Protected with login)

### Admin Login
- Simple email/password authentication for admin access only

### Products Management
- Add, edit, delete gift products (name, description, price, images, category, stock)

### Orders Management
- View all orders with status (pending, shipped, delivered)
- Update order status
- View order details (customer info, items, shipping address)

### Statistics Dashboard
- Total revenue, total orders, total products
- Recent orders overview
- Simple charts for sales trends

### Website Settings
- Edit store name, email, phone number, address
- Update social media links
- These settings display dynamically on the storefront

---

## Backend (Lovable Cloud / Supabase)
- Database for products, orders, site settings, and admin users
- Stripe integration for payment processing
- Row-level security for admin-only access

