# FAQs (Expanded)

## Customers
- Sign up: Choose role → extra fields for Seller/Deliverer → verify email
- Cancel order: Status Placed → Out for Delivery → click Cancel → UI updates
- Returns: Request → seller approves → instructions provided → refund issued
- Payment/Refund: Refunds go to original payment method or wallet
- Product images: Open in Material UI Dialog for consistent UX

## Sellers
- Add product: Fill fields, upload real images → stored in GCS
- Edit product: Keep existing URLs, add new files → FormData sent to backend
- Metrics: Dashboard shows total products, average rating, weekly activity
- Return handling: Accept/reject return requests, metrics auto-updated

## Deliverers
- Accept deliveries: Dashboard → Assigned Orders → Accept
- Mark as delivered: Updates order status → notifies customer
- Metrics: Delivery count, returned orders

## Admin/Developers
- User model: BaseUser + discriminators
- Image storage: GCS → public URLs stored in MongoDB
- Controller behavior: Customer controllers must use Customer discriminator
- addProductController handles GCS uploads