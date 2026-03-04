import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { authenticate } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

/**
 * @route POST /api/payments/initialize/:quoteId
 * @desc Initialize a payment for a quote
 * @access Private
 */
router.post('/initialize/:quoteId', authenticate, async (req: Request, res: Response) => {
    try {
        const quoteId = parseInt(req.params.quoteId);
        const userId = (req as any).user.id;
        const email = (req as any).user.email;

        const paymentData = await PaymentService.initializePaystackTransaction(quoteId, userId, email);
        res.json(paymentData);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/payments/checkout/cart
 * @desc Initialize a payment for the entire cart
 * @access Private
 */
router.post('/checkout/cart', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const email = (req as any).user.email;

        const paymentData = await PaymentService.initializeCartCheckout(userId, email);
        res.json(paymentData);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route GET /api/payments/verify/:reference
 * @desc Manually verify a payment
 * @access Private
 */
router.get('/verify/:reference', authenticate, async (req: Request, res: Response) => {
    try {
        const { reference } = req.params;
        const verificationData = await PaymentService.verifyPaystackTransaction(reference);
        res.json(verificationData);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/payments/webhook/paystack
 * @desc Paystack Webhook handler
 * @access Public
 */
router.post('/webhook/paystack', async (req: Request, res: Response) => {
    try {
        // Verify signature
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).send('Invalid signature');
        }

        await PaymentService.handleWebhook(req.body);
        res.status(200).send('Webhook processed');
    } catch (error: any) {
        console.error('Webhook Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
