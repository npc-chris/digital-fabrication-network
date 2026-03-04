import { db } from '../config/database';
import { affiliateStores, components } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import axios from 'axios';

export class AffiliateService {
    /**
     * Syncs products from a partner's store using their API
     */
    async syncStoreProducts(storeId: number) {
        const [store] = await db
            .select()
            .from(affiliateStores)
            .where(eq(affiliateStores.id, storeId));

        if (!store || !store.apiEndpoint || !store.isActive) {
            throw new Error('Store not found or API integration not configured');
        }

        try {
            // Fetch data from external API
            const response = await axios.get(store.apiEndpoint, {
                headers: store.apiKey ? { 'Authorization': `Bearer ${store.apiKey}` } : {},
            });

            const externalData = response.data;
            const mappings = store.endpointMappings ? JSON.parse(store.endpointMappings as string) : null;

            if (!mappings) {
                throw new Error('No endpoint mappings configured for this store');
            }

            // Convert external data to DFN standard format
            const normalizedProducts = this.normalizeData(externalData, mappings);

            // Upsert components
            for (const product of normalizedProducts) {
                // Simple upsert logic: check by external link or name
                const [existing] = await db
                    .select()
                    .from(components)
                    .where(and(
                        eq(components.affiliateStoreId, storeId),
                        eq(components.name, product.name)
                    ));

                if (existing) {
                    await db
                        .update(components)
                        .set({
                            ...product,
                            updatedAt: new Date(),
                        })
                        .where(eq(components.id, existing.id));
                } else {
                    await db
                        .insert(components)
                        .values({
                            ...product,
                            providerId: store.userId,
                            affiliateStoreId: storeId,
                            isAffiliate: true,
                            supplierType: store.supplierType,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                }
            }

            return {
                success: true,
                syncedCount: normalizedProducts.length,
            };
        } catch (error: any) {
            console.error('Affiliate Sync Error:', error.message);
            throw new Error(`Failed to sync from store: ${error.message}`);
        }
    }

    /**
     * Normalizes external data based on mappings
     */
    private normalizeData(data: any, mappings: any): any[] {
        // Basic implementation: expect data to be an array or under a specific key
        const rawItems = mappings.rootKey ? data[mappings.rootKey] : (Array.isArray(data) ? data : [data]);

        if (!Array.isArray(rawItems)) {
            return [];
        }

        return rawItems.map((item: any) => {
            const normalized: any = {};

            // Map fields based on configuration
            // Example mapping: { "name": "product_name", "price": "cost", "description": "desc" }
            normalized.name = this.getValueByPath(item, mappings.name || 'name');
            normalized.description = this.getValueByPath(item, mappings.description || 'description');
            normalized.price = this.getValueByPath(item, mappings.price || 'price');
            normalized.availability = parseInt(this.getValueByPath(item, mappings.availability || 'stock') || '0');
            normalized.type = mappings.defaultType || 'electrical';
            normalized.externalUrl = this.getValueByPath(item, mappings.externalUrl || 'url');
            normalized.images = JSON.stringify([this.getValueByPath(item, mappings.image || 'image')]);

            // Add default values for required fields in components table
            if (!normalized.name) normalized.name = 'Unnamed Product';
            if (!normalized.price) normalized.price = '0.00';

            return normalized;
        });
    }

    /**
     * Helper to get value from nested object using string path (e.g., "details.price")
     */
    private getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}

export const affiliateService = new AffiliateService();
