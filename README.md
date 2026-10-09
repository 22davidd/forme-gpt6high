# FORME. — Glassmorphism Footwear Store

A fully responsive, **static demo storefront** with 12 individually navigable product pages, four category pages, product search, sorting, favorite toggles, size/color selections, and a cart stored locally in your browser.

## Run it

**Simplest:** double-click `index.html` in the extracted folder. All assets are included locally; no installation, database, or npm required.

**Optional local server:** from the extracted folder, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/

## Pages

- `index.html` — Homepage
- `shop.html` — Full catalog and sorting
- `category/{sneakers,running,slides,boots}.html` — category pages
- `products/*.html` — **12 individual product pages**, each with size/color selectors and bag controls
- `cart.html` — Shopping bag

## Tech

- Vanilla HTML, CSS, JavaScript
- Custom local vector illustrations — no remote images, services, or fonts required
- CSS glassmorphism (blur, frosted panels, gradients, soft lighting)
- Responsive desktop, tablet, and mobile layouts
- Browser `localStorage` cart and favorites

## Important

This is a **front-end concept/demo**. Checkout, inventory, order fulfillment, shipping, and newsletter mailing are not connected to live services. Product names/prices and policies are fictional demo content. To launch a real shop, add a secure backend/payment processor and live business policies.

## Customizing

Update product data in `assets/js/data.js`, appearance in `assets/css/style.css`, and functionality in `assets/js/app.js`. Product images are self-contained SVG assets in `assets/img/`.
