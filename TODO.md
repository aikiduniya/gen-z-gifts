# Fix Discount Price Display Across Products/Deals Sections

**Approved Plan**: Standardize discount handling with safe Number() helpers in GiftDetail.tsx, CustomizeDeal.tsx, AdminProducts.tsx.

## TODO Steps:
- [ ] Step 1: Create/update helpers (getDiscountPrice, hasDiscount, getEffectivePrice, getDiscountPercent) in src/pages/GiftDetail.tsx
- [ ] Step 2: Replace all inline discount checks/JSX in GiftDetail.tsx with helpers (badge, price display, related products)
- [    ] Step 3: Update Product type in GiftDetail.tsx (discount_price?: number \| string \| null)
- [ ] Step 4: Fix helpers & checks in src/components/CustomizeDeal.tsx (deal section)
- [ ] Step 5: Minor type updates in src/pages/AdminProducts.tsx
- [ ] Step 6: Verify no TS errors; test dev server (discount badges/prices/cart for string discounts)
- [ ] Step 7: Update TODO.md complete; attempt_completion

**Status**: Ready to implement step-by-step.

