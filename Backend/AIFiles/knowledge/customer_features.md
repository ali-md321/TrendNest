# Customer Features

## Home & Product Pages
- Left-fixed image/cart section, right-scrollable content
- Similar Products carousel (ProductCard2)
- Add to cart, add to wishlist

## Orders
- Lifecycle: Placed → Confirmed → Shipped → Out for Delivery → Delivered → ReturnRequested → Returned
- Actions: cancel order (Placed → Out for Delivery), track order, request return
- Return workflow: customer requests → seller approves/rejects → return label → refund

## Profile & Addresses
- Editable profile (name, email, phone)
- ManageAddresses component: edit one address at a time, update instead of add, delete with confirmation (MUI Dialog)
- Image previews via Material UI Dialog

## Wallet & Payment
- Payment modes: card, UPI, netbanking
- Refunds credited to original method or TrendNest wallet