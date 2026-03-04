import axios from 'axios';
import { db } from '../config/database';
import { transactions, orders, quotes, notifications, carts, cartItems, components } from '../models/schema';
import { eq, inArray } from 'drizzle-orm';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_URL = 'https://api.paystack.co';

export class PaymentService {
    /**
     * Initialize a Paystack transaction for a quote
     */
    static async initializePaystackTransaction(quoteId: number, userId: number, email: string) {
        try {
            // Get quote details
            const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);

            if (!quote) {
                throw new Error('Quote not found');
            }

            if (quote.userId !== userId) {
                throw new Error('Unauthorized');
            }

            if (!quote.estimatedPrice) {
                throw new Error('Quote has no estimated price');
            }

            const basePrice = parseFloat(quote.estimatedPrice.toString());
            const riskBuffer = quote.riskBuffer ? parseFloat(quote.riskBuffer.toString()) : 0;
            const totalPrice = basePrice + riskBuffer;

            const amount = Math.round(totalPrice * 100); // Paystack expects amount in kobo

            const response = await axios.post(
                `${PAYSTACK_URL}/transaction/initialize`,
                {
                    email,
                    amount,
                    callback_url: process.env.PAYSTACK_CALLBACK_URL,
                    metadata: {
                        quoteId,
                        userId,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status) {
                // Log the transaction attempt
                await db.insert(transactions).values({
                    userId,
                    quoteId,
                    paymentProvider: 'paystack',
                    reference: response.data.data.reference,
                    amount: (amount / 100).toString(),
                    status: 'pending',
                    metadata: JSON.stringify(response.data.data),
                });

                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to initialize transaction');
            }
        } catch (error: any) {
            console.error('Paystack Initialization Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Initialize a Paystack transaction for the entire cart
     */
    static async initializeCartCheckout(userId: number, email: string) {
        try {
            // 1. Get cart items
            const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
            if (!cart) throw new Error('Cart not found');

            const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
            if (items.length === 0) throw new Error('Cart is empty');

            // 2. Calculate total
            const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity), 0);
            const amount = Math.round(totalPrice * 100);

            // 3. Initialize Paystack
            const response = await axios.post(
                `${PAYSTACK_URL}/transaction/initialize`,
                {
                    email,
                    amount,
                    callback_url: process.env.PAYSTACK_CALLBACK_URL,
                    metadata: {
                        userId,
                        cartId: cart.id,
                        type: 'cart_checkout'
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status) {
                // Log transaction
                await db.insert(transactions).values({
                    userId,
                    paymentProvider: 'paystack',
                    reference: response.data.data.reference,
                    amount: totalPrice.toString(),
                    status: 'pending',
                    metadata: JSON.stringify(response.data.data),
                });

                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to initialize cart transaction');
            }
        } catch (error: any) {
            console.error('Cart Checkout Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Verify a Paystack transaction
     */
    static async verifyPaystackTransaction(reference: string) {
        try {
            const response = await axios.get(`${PAYSTACK_URL}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            });

            if (response.data.status && response.data.data.status === 'success') {
                await this.processSuccessfulPayment(response.data.data);
                return response.data.data;
            }
            return response.data.data;
        } catch (error: any) {
            console.error('Paystack Verification Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    /**
     * Process a successful payment (Internal Logic)
     */
    static async processSuccessfulPayment(data: any) {
        const reference = data.reference;
        const userId = data.metadata.userId;
        const type = data.metadata.type;

        // 1. Check if transaction already processed
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.reference, reference))
            .limit(1);

        if (transaction && (transaction.status === 'successful' || transaction.status === 'escrowed')) {
            console.log('Transaction already processed');
            return;
        }

        // 2. Update transaction status
        await db
            .update(transactions)
            .set({
                status: 'successful',
                updatedAt: new Date(),
            })
            .where(eq(transactions.reference, reference));

        if (type === 'cart_checkout') {
            await this.processCartPayment(data);
        } else {
            await this.handleQuotePayment(data, reference);
        }
    }

    private static async handleQuotePayment(data: any, reference: string) {
        const quoteId = data.metadata.quoteId;
        // 3. Create/Update Order
        const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);

        if (quote) {
            const [order] = await db
                .insert(orders)
                .values({
                    explorerId: quote.userId,
                    providerId: quote.providerId,
                    serviceId: quote.serviceId,
                    quoteId: quote.id,
                    totalPrice: (parseFloat(quote.estimatedPrice!.toString()) + parseFloat(quote.riskBuffer?.toString() || '0')).toString(),
                    status: 'ordered',
                    paymentStatus: 'escrowed',
                    notes: quote.notes,
                })
                .returning();

            await db.update(transactions).set({ orderId: order.id, status: 'escrowed' }).where(eq(transactions.reference, reference));
            await db.update(quotes).set({ status: 'approved', updatedAt: new Date() }).where(eq(quotes.id, quoteId));

            await db.insert(notifications).values({
                userId: quote.userId,
                type: 'order',
                title: 'Payment Successful',
                message: `Your payment for quote #${quoteId} was successful. Order #${order.id} has been created.`,
                relatedType: 'order',
                relatedId: order.id,
            });
        }
    }

    private static async processCartPayment(data: any) {
        const userId = data.metadata.userId;
        const cartId = data.metadata.cartId;

        // Get cart items and components to find providers
        const items = await db.select({
            cartItem: cartItems,
            component: components
        })
            .from(cartItems)
            .leftJoin(components, eq(cartItems.componentId, components.id))
            .where(eq(cartItems.cartId, cartId));

        // Create orders for each internal component (grouped by provider)
        // For affiliate items, we might just mark them as 'purchased' or ignore if we don't fulfillment
        for (const item of items) {
            if (item.component) {
                const totalPrice = (parseFloat(item.cartItem.price.toString()) * item.cartItem.quantity).toString();
                await db.insert(orders).values({
                    explorerId: userId,
                    providerId: item.component.providerId,
                    componentId: item.component.id,
                    quantity: item.cartItem.quantity,
                    totalPrice,
                    status: 'ordered',
                    paymentStatus: 'successful', // Direct purchase from store
                });
            }
        }

        // Clear cart
        await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    }

    /**
     * Handle Paystack Webhook
     */
    static async handleWebhook(event: any) {
        const { event: eventType, data } = event;

        if (eventType === 'charge.success') {
            await this.processSuccessfulPayment(data);
        }

        // Handle other events if necessary (e.g. failed payment)
        if (eventType === 'charge.failed') {
            await db
                .update(transactions)
                .set({
                    status: 'failed',
                    updatedAt: new Date(),
                })
                .where(eq(transactions.reference, data.reference));
        }
    }
}
