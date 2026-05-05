# Discount Price Issue - Progress Tracker

## ✅ COMPLETED

All components now use safe `Number()` parsing for `discount_price` (string from API → number):

- [x] GiftGrid.tsx - `getDiscountPrice()` with `Number()` + null/NaN checks
- [x] GiftDetail.tsx - Same pattern with `getDiscountPrice()`, `hasDiscount()`, `getEffectivePrice()`
- [x] QuickViewDialog.tsx - Same safe parsing
- [x] CustomizeDeal.tsx - Same safe parsing
- [x] AdminProducts.tsx - Fixed `Number(p.discount_price) > 0` comparison
- [x] CheckoutSuggestedProducts.tsx - Uses `Number(p.price)` during mapping
- [x] Cart store always receives `number` type for price
