const API_BASE = 'http://localhost:3000/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6IkFkbWluIFVzZXIiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwic3ViIjo1LCJpYXQiOjE3ODE5NTY4NjEsImV4cCI6NDM3Mzk1Nzc2MX0.d8gSQrzZaAH2N6C5McXDmy-TG5qQjO308fv4kp3pAuE'; // <-- PASTE YOUR ADMIN TOKEN HERE

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const categories = [
  // ── Root: Electronics ──────────────────────────────────────
  {
    name: 'Electronics',
    slug: 'electronics',
    sortOrder: 1,
    image: 'https://picsum.photos/seed/electronics/400/400',
  },
  // Children of Electronics
  {
    name: 'Smartphones',
    slug: 'smartphones',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/smartphones/400/400',
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/laptops/400/400',
  },
  {
    name: 'Tablets',
    slug: 'tablets',
    parentId: null,
    sortOrder: 3,
    image: 'https://picsum.photos/seed/tablets/400/400',
  },
  // Grandchildren of Electronics → Smartphones
  {
    name: 'iPhone',
    slug: 'iphone',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/iphone/400/400',
  },
  {
    name: 'Android Phones',
    slug: 'android-phones',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/android/400/400',
  },
  // Grandchildren of Electronics → Laptops
  {
    name: 'Gaming Laptops',
    slug: 'gaming-laptops',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/gaming-laptop/400/400',
  },
  {
    name: 'Ultrabooks',
    slug: 'ultrabooks',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/ultrabook/400/400',
  },

  // ── Root: Fashion ──────────────────────────────────────────
  {
    name: 'Fashion',
    slug: 'fashion',
    sortOrder: 2,
    image: 'https://picsum.photos/seed/fashion/400/400',
  },
  {
    name: 'Men',
    slug: 'men',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/men-fashion/400/400',
  },
  {
    name: 'Women',
    slug: 'women',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/women-fashion/400/400',
  },
  {
    name: 'Kids',
    slug: 'kids',
    parentId: null,
    sortOrder: 3,
    image: 'https://picsum.photos/seed/kids-fashion/400/400',
  },
  // Grandchildren of Fashion → Men
  {
    name: 'T-Shirts',
    slug: 'tshirts',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/tshirts/400/400',
  },
  {
    name: 'Jeans',
    slug: 'jeans',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/jeans/400/400',
  },
  // Grandchildren of Fashion → Women
  {
    name: 'Dresses',
    slug: 'dresses',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/dresses/400/400',
  },
  {
    name: 'Ethnic Wear',
    slug: 'ethnic-wear',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/ethnic/400/400',
  },

  // ── Root: Home & Kitchen ───────────────────────────────────
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    sortOrder: 3,
    image: 'https://picsum.photos/seed/home-kitchen/400/400',
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/furniture/400/400',
  },
  {
    name: 'Cookware',
    slug: 'cookware',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/cookware/400/400',
  },
  // Grandchildren of Home → Furniture
  {
    name: 'Sofas',
    slug: 'sofas',
    parentId: null,
    sortOrder: 1,
    image: 'https://picsum.photos/seed/sofas/400/400',
  },
  {
    name: 'Tables',
    slug: 'tables',
    parentId: null,
    sortOrder: 2,
    image: 'https://picsum.photos/seed/tables/400/400',
  },
];

export async function seed1() {
  const token = TOKEN || process.argv[2];
  if (!token) {
    console.error('Please provide your admin token as an argument or edit TOKEN in the script.');
    console.error('Usage: node src/seeds/categories.seed.js <YOUR_TOKEN>');
    process.exit(1);
  }

  const created = {};

  for (const cat of categories) {
    const payload = {
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
      image: cat.image,
      parentId: cat.parentId ? created[cat.parentId] : null,
    };

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error(`❌ Failed: ${cat.name} — ${body?.error?.message || res.statusText}`);
        continue;
      }
      created[cat.slug] = body.data.id;
      console.log(`✅ Created: ${cat.name} (id: ${body.data.id}) ${cat.parentId ? '→ parent: ' + cat.parentId : '→ ROOT'}`);
    } catch (err) {
      console.error(`❌ Failed: ${cat.name} — ${err.message}`);
    }
  }

  console.log('\n🎉 Done! Check GET /api/v1/categories/tree');
}

// seed();
