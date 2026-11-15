// api/commerce.js — ClickDash Multi-Store Commerce Router
import express from "express";
import crypto from "crypto";
import pool from "../db.js";

const router = express.Router();

// Executive Rollup (CEO Clearance)
router.get("/executive/rollup", async (req, res) => {
  try {
    const storesRes = await pool.query("SELECT * FROM stores ORDER BY store_name ASC");
    const statsRes = await pool.query(`
      SELECT 
        COUNT(DISTINCT s.store_id)::int AS total_stores,
        COALESCE(SUM(p.stock_qty), 0)::int AS total_units_across_network,
        COALESCE(SUM(p.stock_qty * p.retail_price), 0)::numeric(12,2) AS total_network_retail_value,
        COALESCE(SUM(CASE WHEN p.stock_qty <= p.min_alert_qty THEN 1 ELSE 0 END), 0)::int AS total_low_stock_skus
      FROM stores s
      LEFT JOIN products p ON s.store_id = p.store_id
    `);
    const txRes = await pool.query(`
      SELECT COUNT(*)::int AS total_transactions, COALESCE(SUM(total_amount), 0)::numeric(12,2) AS gross_network_revenue
      FROM transactions
    `);

    res.json({
      status: "AUTHORIZED",
      executive_rollup: {
        network_summary: statsRes.rows[0],
        sales_summary: txRes.rows[0],
        stores: storesRes.rows
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multi-Store PIN Authentication
router.post("/login", async (req, res) => {
  const { store_id = "STORE-5611", username, pin_code } = req.body || {};
  if (!username || !pin_code) {
    return res.status(400).json({ error: "Store ID, username, and PIN required." });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.store_id, u.username, u.role, u.full_name, s.store_name 
       FROM store_users u JOIN stores s ON u.store_id = s.store_id
       WHERE u.store_id = $1 AND u.username = $2 AND u.pin_code = $3`,
      [store_id.toUpperCase(), username.toLowerCase(), pin_code]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid store credentials or PIN." });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(24).toString("hex");
    res.json({ status: "AUTHENTICATED", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tenant-Scoped Inventory Fetch
router.get("/:storeId/inventory", async (req, res) => {
  const storeId = req.params.storeId.toUpperCase();
  try {
    const productsRes = await pool.query(
      "SELECT * FROM products WHERE store_id = $1 ORDER BY name ASC",
      [storeId]
    );
    res.json({ store_id: storeId, products: productsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atomic POS Checkout
router.post("/:storeId/checkout", async (req, res) => {
  const storeId = req.params.storeId.toUpperCase();
  const { cashier_username = "cashier1", payment_method = "CASH", items = [] } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart items required for checkout." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const prodRes = await client.query(
        "SELECT * FROM products WHERE store_id = $1 AND sku_barcode = $2 FOR UPDATE",
        [storeId, item.sku_barcode]
      );

      if (prodRes.rows.length === 0) throw new Error(`SKU ${item.sku_barcode} not found.`);

      const prod = prodRes.rows[0];
      const qty = Number(item.qty) || 1;
      const newQty = Math.max(0, prod.stock_qty - qty);
      const lineTotal = Number(prod.retail_price) * qty;
      totalAmount += lineTotal;

      await client.query("UPDATE products SET stock_qty = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newQty, prod.id]);
      await client.query(
        `INSERT INTO stock_logs (store_id, sku_barcode, product_name, change_type, qty_delta, notes) VALUES ($1, $2, $3, 'POS_SALE', $4, $5)`,
        [storeId, prod.sku_barcode, prod.name, -qty, `POS Checkout (${payment_method})`]
      );

      processedItems.push({ sku_barcode: prod.sku_barcode, name: prod.name, qty, unit_price: Number(prod.retail_price), line_total: lineTotal });
    }

    const txId = `TX-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    await client.query(
      `INSERT INTO transactions (tx_id, store_id, cashier_username, total_amount, payment_method, items_json) VALUES ($1, $2, $3, $4, $5, $6)`,
      [txId, storeId, cashier_username, totalAmount.toFixed(2), payment_method, JSON.stringify(processedItems)]
    );

    await client.query("COMMIT");
    res.status(201).json({ status: "COMPLETED", tx_id: txId, total_amount: totalAmount.toFixed(2), items: processedItems });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
