# Backend / Developer Insights

## Mongoose Schemas
- BaseUser → discriminator models: Customer, Seller, Deliverer, Admin
- Product schema: title, description, highlights[], price, discountedPrice, stock, category, images[], seller ref, reviews[]
- Order schema: productDetails (snapshot/ref), customer ref, status enum, timestamps

## Controllers
- addProductController: receives FormData → uploads images to GCS → stores URLs in Product schema
- Customer controllers: cart, wishlist, orders (must use Customer discriminator)
- Seller metrics: aggregate uploadedProducts & reviews
- updateWeeklyActivity: track weekly product/review activity

## AI / Embedding Integration
- Customer support bots: embed FAQs & docs into vector DB (MongoDB)
- Use embeddings (Vertex AI or other) → retrieve relevant KB chunks → answer queries