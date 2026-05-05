const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to generate slug from name
const generateSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let counter = 0;
    while (true) {
        let query = 'SELECT id FROM products WHERE slug = ?';
        let params = [slug];
        if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
        const [rows] = await pool.execute(query, params);
        if (rows.length === 0) break;
        counter++;
        slug = `${baseSlug}-${counter}`;
    }
    return slug;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '../../public/products');
        if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
});
  
const upload = multer({
storage: storage,
limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
},
fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
    return cb(null, true);
    } else {
    cb(new Error('Only image files are allowed!'));
    }
}
});

const router = express.Router();

// Get product by slug
router.get('/products/by-slug/:slug', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE slug = ? AND is_active = 1', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = rows[0];
    if (product.image_urls) {
        try {
            product.image_urls = JSON.parse(product.image_urls);
        } catch (e) {
            product.image_urls = [];
        }
    } else {
        product.image_urls = [];
    }
    
    // Get total sold quantity from order_items
    const [soldRows] = await pool.execute(
        'SELECT COALESCE(SUM(quantity), 0) as sold FROM order_items WHERE product_id = ?',
        [product.id]
    );
    product.sold = soldRows[0].sold || 0;
    
    res.json(product);
} catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.get('/products', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY sort_order ASC');
    
    // Get sold quantities for all products in one query
    const productIds = rows.map(p => p.id);
    let soldData = {};
    if (productIds.length > 0) {
        const placeholders = productIds.map(() => '?').join(',');
        const [soldRows] = await pool.execute(
            `SELECT product_id, COALESCE(SUM(quantity), 0) as sold FROM order_items WHERE product_id IN (${placeholders}) GROUP BY product_id`,
            productIds
        );
        soldRows.forEach(row => {
            soldData[row.product_id] = row.sold;
        });
    }
    
    // Parse image_urls JSON string to array for each product
    const products = rows.map((product) => {
        if (product.image_urls) {
            try {
                product.image_urls = JSON.parse(product.image_urls);
            } catch (e) {
                product.image_urls = [];
            }
        } else {
            product.image_urls = [];
        }
        // Add sold quantity to product
        product.sold = soldData[product.id] || 0;
        return product;
    });
    
    res.json(products);
} catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.get('/products/list', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE is_active=1 ORDER BY sort_order ASC');
    
    // Parse image_urls JSON string to array for each product
    const products = rows.map((product) => {
        if (product.image_urls) {
            try {
                product.image_urls = JSON.parse(product.image_urls);
            } catch (e) {
                product.image_urls = [];
            }
        } else {
            product.image_urls = [];
        }
        return product;
    });
    
    res.json(products);
} catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.get('/products/:id', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = rows[0];
    if (product.image_urls) {
        try {
            product.image_urls = JSON.parse(product.image_urls);
        } catch (e) {
            product.image_urls = [];
        }
    } else {
        product.image_urls = [];
    }
    
    res.json(product);
} catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/products', async (req, res) => {
try {
    const { name, description, price, discount_price, image_urls, category, stock, slug } = req.body;
    
    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (price === undefined || price === null || price < 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }
    
    const id = crypto.randomUUID();
    
    // Generate unique slug from name
    const baseSlug = generateSlug(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);
    
    // Handle image_urls as JSON array or fall back to null
    let productImageUrls = null;
    if (image_urls && Array.isArray(image_urls)) {
        productImageUrls = JSON.stringify(image_urls);
    } else if (image_urls) {
        // If it's a single string, wrap it in an array and stringify
        productImageUrls = JSON.stringify([image_urls]);
    }
    
    const [result] = await pool.execute(
    'INSERT INTO products (id, name, slug, description, price, discount_price, image_urls, category, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, uniqueSlug, description || '', price, discount_price || 0, productImageUrls, category || 'General', stock || 0, 1]
    );
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    // Parse image_urls back to array for response
    const product = rows[0];
    if (product.image_urls) {
        try {
            product.image_urls = JSON.parse(product.image_urls);
        } catch (e) {
            product.image_urls = [];
        }
    } else {
        product.image_urls = [];
    }
    
    res.status(201).json({
        success: true,
        message: 'Product added successfully',
        product
    });
} catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Reorder products endpoint - MUST be before /products/:id to avoid route conflict
router.put('/products/reorder', async (req, res) => {
try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Products array is required' });
    }
    
    // Assign unique sequential sort_order values based on array position
    // This ensures no duplicates regardless of input
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (product.id) {
            // Use the array index as sort_order (0, 1, 2, 3, ...)
            // This guarantees unique values without duplicates
            await pool.execute(
                'UPDATE products SET sort_order = ? WHERE id = ?',
                [i, product.id]
            );
        }
    }
    
    res.json({ success: true, message: 'Products reordered successfully' });
} catch (error) {
    console.error('Reorder products error:', error);
    res.status(500).json({ error: 'Failed to reorder products' });
}
});

router.put('/products/:id', async (req, res) => {
try {
    const { name, description, price, discount_price, image_urls, category, stock, is_active, slug } = req.body;
    
    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (price === undefined || price === null || price < 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }
    
    // Generate unique slug from name (for update)
    const baseSlug = generateSlug(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, req.params.id);
    
    // Handle image_urls as JSON array
    let productImageUrls = null;
    if (image_urls && Array.isArray(image_urls)) {
        productImageUrls = JSON.stringify(image_urls);
    } else if (image_urls) {
        productImageUrls = JSON.stringify([image_urls]);
    }
    
    const [result] = await pool.execute(
    'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, discount_price = ?, image_urls = ?, category = ?, stock = ?, is_active = ? WHERE id = ?',
    [name, uniqueSlug, description || '', price, discount_price || 0, productImageUrls, category || 'General', stock || 0, is_active ?? 1, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    // Parse image_urls back to array for response
    const product = rows[0];
    if (product.image_urls) {
        try {
            product.image_urls = JSON.parse(product.image_urls);
        } catch (e) {
            product.image_urls = [];
        }
    } else {
        product.image_urls = [];
    }
    
    res.json(product);
} catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Image upload endpoint
router.post('/products/upload', upload.single('image'), (req, res) => {
try {
    if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
    }
    const uploadedFile = {
        url: `/public/products/${req.file.filename}`,
        filename: req.file.filename
    };
    res.json({
    success: true,
    url: uploadedFile.url,
    filename: uploadedFile.filename
    });
} catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
}
});

router.delete('/products/:id', async (req, res) => {
try {
    const [result] = await pool.execute('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
} catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

module.exports = router;
