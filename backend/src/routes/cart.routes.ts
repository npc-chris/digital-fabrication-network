import { Router, Response } from 'express';
import { db } from '../config/database';
import { carts, cartItems, components, affiliateStores } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get user's cart with items
router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Get or create cart
    let [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      [cart] = await db
        .insert(carts)
        .values({ userId })
        .returning();
    }

    // Get cart items with component/affiliate details
    const items = await db
      .select({
        item: cartItems,
        component: components,
        affiliateStore: affiliateStores,
      })
      .from(cartItems)
      .leftJoin(components, eq(cartItems.componentId, components.id))
      .leftJoin(affiliateStores, eq(cartItems.affiliateStoreId, affiliateStores.id))
      .where(eq(cartItems.cartId, cart.id));

    // Group items by vendor
    interface GroupedItem {
      vendorKey: string;
      vendorName: string;
      vendorType: string;
      items: typeof items;
      subtotal: number;
    }
    const groupedItems = items.reduce((acc: Record<string, GroupedItem>, item: typeof items[0]) => {
      let vendorKey: string;
      let vendorName: string;
      let vendorType: string;

      if (item.component) {
        vendorKey = `component_${item.component.providerId}`;
        vendorName = 'DFN Direct';
        vendorType = 'internal';
      } else if (item.affiliateStore) {
        vendorKey = `affiliate_${item.affiliateStore.id}`;
        vendorName = item.affiliateStore.storeName;
        vendorType = 'affiliate';
      } else {
        vendorKey = 'unknown';
        vendorName = 'Unknown';
        vendorType = 'unknown';
      }

      if (!acc[vendorKey]) {
        acc[vendorKey] = {
          vendorKey,
          vendorName,
          vendorType,
          items: [],
          subtotal: 0,
        };
      }

      acc[vendorKey].items.push(item);
      acc[vendorKey].subtotal += parseFloat(item.item.price) * item.item.quantity;

      return acc;
    }, {});

    res.json({
      cart,
      vendors: Object.values(groupedItems),
      totalItems: items.length,
      totalPrice: items.reduce((sum, item) => sum + (parseFloat(item.item.price) * item.item.quantity), 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post('/items', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      componentId,
      affiliateStoreId,
      quantity,
      price,
      externalProductId,
      externalProductUrl,
      productName,
      productImage,
    } = req.body;

    // Validate that either componentId or affiliateStoreId is provided
    if (!componentId && !affiliateStoreId) {
      return res.status(400).json({ error: 'Either componentId or affiliateStoreId is required' });
    }

    // Get or create cart
    let [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      [cart] = await db
        .insert(carts)
        .values({ userId })
        .returning();
    }

    // Check if item already exists in cart
    const conditions = [eq(cartItems.cartId, cart.id)];
    if (componentId) {
      conditions.push(eq(cartItems.componentId, componentId));
    }
    if (affiliateStoreId) {
      conditions.push(eq(cartItems.affiliateStoreId, affiliateStoreId));
    }
    if (externalProductId) {
      conditions.push(eq(cartItems.externalProductId, externalProductId));
    }

    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(...conditions));

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + (quantity || 1),
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();

      return res.json(updated);
    }

    // Add new item
    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        componentId: componentId || null,
        affiliateStoreId: affiliateStoreId || null,
        quantity: quantity || 1,
        price,
        externalProductId: externalProductId || null,
        externalProductUrl: externalProductUrl || null,
        productName: productName || null,
        productImage: productImage || null,
      })
      .returning();

    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/items/:itemId', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Verify ownership
    const [item] = await db
      .select({
        item: cartItems,
        cart: carts,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(eq(cartItems.id, itemId));

    if (!item || item.cart.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/items/:itemId', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const itemId = parseInt(req.params.itemId);

    // Verify ownership
    const [item] = await db
      .select({
        item: cartItems,
        cart: carts,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(eq(cartItems.id, itemId));

    if (!item || item.cart.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    res.json({ message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (cart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    res.json({ message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import items from affiliate store cart
router.post('/import-affiliate', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { affiliateStoreId, items } = req.body;

    if (!affiliateStoreId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify affiliate store exists
    const [store] = await db
      .select()
      .from(affiliateStores)
      .where(eq(affiliateStores.id, affiliateStoreId));

    if (!store) {
      return res.status(404).json({ error: 'Affiliate store not found' });
    }

    // Get or create cart
    let [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      [cart] = await db
        .insert(carts)
        .values({ userId })
        .returning();
    }

    // Add items to cart
    const cartItemsData = items.map((item: any) => ({
      cartId: cart.id,
      affiliateStoreId,
      quantity: item.quantity || 1,
      price: item.price,
      externalProductId: item.externalProductId,
      externalProductUrl: item.externalProductUrl,
      productName: item.productName,
      productImage: item.productImage,
    }));

    const addedItems = await db
      .insert(cartItems)
      .values(cartItemsData)
      .returning();

    res.status(201).json({
      message: `${addedItems.length} items imported successfully`,
      items: addedItems,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
