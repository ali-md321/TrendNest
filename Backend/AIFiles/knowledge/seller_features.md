# Seller Features

## Dashboard Layout
- Sidebar navigation: Dashboard, Add Product, Profile Info, Reviews & Ratings
- Dashboard metrics:
  - Total products
  - Average rating (0.5 intervals)
  - Weekly graphs (products added, reviews added) using Recharts/Chart.js

## Product Management
- Add Product: title, description, highlights (comma-separated), brand, category, price, discounted price, stock, images
- Edit Product: fetch via getSellerProductAction → prepopulate form → keep/remove images → submit FormData
- Image upload: stored on Google Cloud Storage → public URLs in Product schema
- ShowSellerProduct component: fetch product details + all reviews; review images open in Material UI Dialog

## Profile Info
- Editable shop info, GST, bank details, social handles
- Start disabled → enable on “Edit”
- Delete/confirmation via MUI Dialog

## Orders & Returns
- View orders with seller’s products
- Accept/decline return requests
- Metrics updated based on productActivity & reviewActivity