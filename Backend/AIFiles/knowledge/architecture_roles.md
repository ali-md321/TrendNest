# Architecture & Role Design

## Multi-role system
- BaseUser schema → discriminators: Customer, Seller, Deliverer, Admin
- Shared fields: name, email, phone, password, role, profileImage
- Customer: cart, wishlist, orders, addresses
- Seller: shop info, GST, bank details, social handles, uploadedProducts, reviews
- Deliverer: assignedOrders, delivery history, metrics
- Admin: user/role management, content moderation, billing

## Role-specific signup
- Dynamic form fields based on selected role:
  - Seller → shop name, GST, bank details
  - Deliverer → service areas, vehicle info
  - Admin → admin code, optional metadata