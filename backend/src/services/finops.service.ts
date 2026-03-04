import { db } from '../config/database';
import { quotes } from '../models/schema';
import { eq } from 'drizzle-orm';

export class FinOpsService {
    /**
     * Calculates the risk buffer based on the buildability score.
     * Logic: 100% Score = 0% Risk Fee; 70% Score = 15% Risk Buffer.
     * Linear interpolation: buffer% = (100 - score) * 0.5
     * Example: 100 -> 0%, 90 -> 5%, 80 -> 10%, 70 -> 15%
     */
    static calculateRiskBuffer(score: number, basePrice: number): number {
        if (score >= 100) return 0;

        // Formula: buffer percentage increases as score decreases
        // at 70, (100-70) * 0.5 = 15%
        const bufferPercentage = (100 - score) * 0.5;
        const bufferAmount = (basePrice * bufferPercentage) / 100;

        return Math.round(bufferAmount * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Updates a quote with a buildability score and adjusts the price if needed.
     */
    static async updateQuoteRisk(quoteId: number, score: number) {
        const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);

        if (!quote || !quote.estimatedPrice) {
            // Just update the score if price isn't set yet
            await db.update(quotes)
                .set({ buildabilityScore: score, updatedAt: new Date() })
                .where(eq(quotes.id, quoteId));
            return;
        }

        const basePrice = parseFloat(quote.estimatedPrice.toString());
        const riskBuffer = this.calculateRiskBuffer(score, basePrice);

        await db.update(quotes)
            .set({
                buildabilityScore: score,
                riskBuffer: riskBuffer.toString(),
                updatedAt: new Date()
            })
            .where(eq(quotes.id, quoteId));
    }
}
