import * as fs from 'fs';
import * as path from 'path';
import storageService from './storage.service';
import { db } from '../config/database';
import { projectAssets, pipelineExecutions, buildPipelines, machineCapabilities } from '../models/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * RunnerService handles the background execution of hardware build steps.
 * It manages the "Hardware Runner" which validates and processes hardware files.
 */
export class RunnerService {
    /**
     * Executes the hardware build steps defined in a build pipeline.
     */
    async triggerPipeline(assetId: number, triggerUserId?: number) {
        // 1. Get asset details
        const assets = await db.select().from(projectAssets).where(eq(projectAssets.id, assetId));
        if (assets.length === 0) return;
        const asset = assets[0];

        // 2. Fetch or create a default pipeline for the project
        let [pipeline] = await db.select().from(buildPipelines).where(eq(buildPipelines.projectId, asset.projectId));

        if (!pipeline) {
            // Create a default pipeline based on file type
            const defaultDefinition = this.getDefaultPipelineDefinition(asset.fileType);
            const [newPipeline] = await db.insert(buildPipelines).values({
                projectId: asset.projectId,
                name: `Standard ${asset.hardwareFormat || 'Hardware'} Pipeline`,
                definition: JSON.stringify(defaultDefinition),
                isActive: true
            }).returning();
            pipeline = newPipeline;
        }

        // 3. Create execution record
        const execution = await db.insert(pipelineExecutions).values({
            pipelineId: pipeline.id,
            assetId: asset.id,
            triggerUserId,
            status: 'running',
            progress: 0,
            startedAt: new Date(),
        }).returning();

        const executionId = execution[0].id;

        try {
            const steps = JSON.parse(pipeline.definition);
            const results: any[] = [];

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const progress = Math.round(((i) / steps.length) * 100);

                // Update progress
                await db.update(pipelineExecutions)
                    .set({ progress })
                    .where(eq(pipelineExecutions.id, executionId));

                // Execute step
                const stepResult = await this.executeStep(step, asset, executionId);
                results.push({ step: step.type, result: stepResult });
            }

            // Final Update: Success
            await db.update(pipelineExecutions)
                .set({
                    status: 'completed',
                    progress: 100,
                    results: JSON.stringify(results),
                    completedAt: new Date()
                })
                .where(eq(pipelineExecutions.id, executionId));

        } catch (error: any) {
            console.error(`Pipeline execution ${executionId} failed:`, error);
            await db.update(pipelineExecutions)
                .set({
                    status: 'failed',
                    results: JSON.stringify({ error: error.message }),
                    completedAt: new Date()
                })
                .where(eq(pipelineExecutions.id, executionId));
        }
    }

    /**
     * Executes a single build step.
     */
    private async executeStep(step: any, asset: any, executionId: number) {
        switch (step.type) {
            case 'generate_3d_preview':
                return this.handleStlToGlb(asset);
            case 'wall_thickness_guard':
                return this.handleWallThicknessGuard(asset);
            case 'pcb_drc':
                return this.handlePcbDRC(asset);
            case 'capability_matcher':
                return this.handleCapabilityMatcher(asset, step.params?.providerId);
            default:
                console.warn(`Unknown step type: ${step.type}`);
                return { status: 'skipped', message: 'Unknown step type' };
        }
    }

    /**
     * Returns a default pipeline based on file extension.
     */
    private getDefaultPipelineDefinition(fileType: string) {
        if (fileType === '.stl') {
            return [
                { type: 'wall_thickness_guard', params: {} },
                { type: 'generate_3d_preview', params: {} }
            ];
        } else if (fileType === '.brd' || fileType === '.gerber') {
            return [
                { type: 'pcb_drc', params: {} }
            ];
        } else {
            return [
                { type: 'capability_matcher', params: {} }
            ];
        }
    }

    /**
     * PROTOTYPE: Wall Thickness Guard using mesh bounding box analysis.
     */
    private async handleWallThicknessGuard(asset: any) {
        console.log(`[Runner] Executing Wall Thickness Guard for ${asset.fileName}`);

        try {
            const filePath = this.getLocalPath(asset.fileUrl);
            if (!filePath || !fs.existsSync(filePath)) {
                return { status: 'warning', message: 'File not available for local analysis' };
            }

            const meshStats = await this.analyzeStl(filePath);

            // Simple logic: if any dimension is < 1mm, it's a "Thin Wall" warning
            const dimensions = {
                x: meshStats.max.x - meshStats.min.x,
                y: meshStats.max.y - meshStats.min.y,
                z: meshStats.max.z - meshStats.min.z
            };

            const minDimension = Math.min(dimensions.x, dimensions.y, dimensions.z);
            const warnings = [];

            if (minDimension < 1.0) {
                warnings.push(`Extreme thin section detected: ${minDimension.toFixed(2)}mm`);
            }

            // Volume-to-BB ratio check (low ratio suggests thin shells or lattice)
            const bbVolume = dimensions.x * dimensions.y * dimensions.z;
            const density = meshStats.volume / bbVolume;

            if (density < 0.05) {
                warnings.push(`Low density detected (${(density * 100).toFixed(1)}%). Structural integrity risk.`);
            }

            // Update asset metadata with stats
            const metadata = asset.metadata ? JSON.parse(asset.metadata) : {};
            metadata.stats = { ...meshStats, dimensions };
            metadata.buildabilityScore = warnings.length === 0 ? 100 : Math.max(0, 100 - (warnings.length * 30));

            await db.update(projectAssets)
                .set({ metadata: JSON.stringify(metadata) })
                .where(eq(projectAssets.id, asset.id));

            return {
                status: warnings.length === 0 ? 'pass' : 'warning',
                score: metadata.buildabilityScore,
                stats: metadata.stats,
                warnings
            };
        } catch (error: any) {
            console.error('Wall thickness analysis failed:', error);
            return { status: 'fail', error: error.message };
        }
    }

    /**
     * PROTOTYPE: Capability Matcher.
     * Diffs asset stats against Provider capabilities.
     */
    private async handleCapabilityMatcher(asset: any, providerId?: number) {
        if (!providerId) return { status: 'skipped', message: 'No provider selected for matching' };

        const metadata = asset.metadata ? JSON.parse(asset.metadata) : {};
        const stats = metadata.stats;

        if (!stats) return { status: 'fail', message: 'No file analysis stats found. Run validation first.' };

        // 1. Fetch real machine capabilities for the provider
        const capacities = await db
            .select()
            .from(machineCapabilities)
            .where(and(
                eq(machineCapabilities.providerId, providerId),
                eq(machineCapabilities.isActive, true)
            ))
            .orderBy(desc(machineCapabilities.updatedAt));

        if (capacities.length === 0) {
            return {
                status: 'warning',
                message: 'Provider has not defined machine capabilities. Proceeding with standard safety buffer.'
            };
        }

        // 2. Select the best matching machine for the file type
        const machine = capacities[0]; // Simplification: pick first active machine
        const issues = [];

        // 3. Wall Thickness Check
        const minWall = parseFloat(machine.minWallThickness || '0.8');
        const fileMinDim = Math.min(stats.dimensions.x, stats.dimensions.y, stats.dimensions.z);
        if (fileMinDim < minWall) {
            issues.push(`Smallest feature (${fileMinDim.toFixed(2)}mm) is below machine limit (${minWall}mm)`);
        }

        // 4. Volume Check (Parsing 300x300x400 format)
        if (machine.maxVolume) {
            const dims = machine.maxVolume.toLowerCase().split('x').map(d => parseFloat(d));
            if (dims.length === 3) {
                if (stats.dimensions.x > dims[0] || stats.dimensions.y > dims[1] || stats.dimensions.z > dims[2]) {
                    issues.push(`Model dimensions exceed machine build volume (${machine.maxVolume})`);
                }
            }
        }

        return {
            status: issues.length === 0 ? 'compatible' : 'incompatible',
            issues,
            machineId: machine.id,
            machineType: machine.machineType,
            providerId
        };
    }

    /**
     * Simple STL Parser to calculate bounding box and volume.
     */
    private async analyzeStl(filePath: string): Promise<any> {
        const buffer = fs.readFileSync(filePath);
        const header = buffer.toString('utf8', 0, 80);

        let min = { x: Infinity, y: Infinity, z: Infinity };
        let max = { x: -Infinity, y: -Infinity, z: -Infinity };
        let volume = 0;

        // Check if Binary or ASCII
        if (header.trim().startsWith('solid') && !this.isProbablyBinary(buffer)) {
            // ASCII parsing logic (simplified)
            const content = buffer.toString('utf8');
            const lines = content.split('\n');
            let vCount = 0;
            let currentFacet: any[] = [];

            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                if (parts[0] === 'vertex') {
                    const v = { x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) };
                    this.updateBounds(v, min, max);
                    currentFacet.push(v);
                    if (currentFacet.length === 3) {
                        volume += this.signedVolumeOfTriangle(currentFacet[0], currentFacet[1], currentFacet[2]);
                        currentFacet = [];
                    }
                }
            }
        } else {
            // Binary parsing
            const faceCount = buffer.readUInt32LE(80);
            let offset = 84;

            for (let i = 0; i < faceCount; i++) {
                // Skip Normal (12 bytes)
                offset += 12;

                const v1 = { x: buffer.readFloatLE(offset), y: buffer.readFloatLE(offset + 4), z: buffer.readFloatLE(offset + 8) };
                offset += 12;
                const v2 = { x: buffer.readFloatLE(offset), y: buffer.readFloatLE(offset + 4), z: buffer.readFloatLE(offset + 8) };
                offset += 12;
                const v3 = { x: buffer.readFloatLE(offset), y: buffer.readFloatLE(offset + 4), z: buffer.readFloatLE(offset + 8) };
                offset += 12;

                // Skip Attribute byte count (2 bytes)
                offset += 2;

                this.updateBounds(v1, min, max);
                this.updateBounds(v2, min, max);
                this.updateBounds(v3, min, max);

                volume += this.signedVolumeOfTriangle(v1, v2, v3);
            }
        }

        return { min, max, volume: Math.abs(volume) };
    }

    private updateBounds(v: any, min: any, max: any) {
        min.x = Math.min(min.x, v.x); min.y = Math.min(min.y, v.y); min.z = Math.min(min.z, v.z);
        max.x = Math.max(max.x, v.x); max.y = Math.max(max.y, v.y); max.z = Math.max(max.z, v.z);
    }

    private signedVolumeOfTriangle(p1: any, p2: any, p3: any) {
        return (p1.x * p2.y * p3.z + p1.y * p2.z * p3.x + p1.z * p2.x * p3.y - p1.x * p2.z * p3.y - p1.y * p2.x * p3.z - p1.z * p2.y * p3.x) / 6.0;
    }

    private isProbablyBinary(buffer: Buffer) {
        // Binary STL always has expected size: 84 + 50 * faceCount
        if (buffer.length < 84) return false;
        const faceCount = buffer.readUInt32LE(80);
        return buffer.length === 84 + 50 * faceCount;
    }

    private getLocalPath(fileUrl: string): string | null {
        const localUploadDir = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
        if (fileUrl.includes('/uploads/')) {
            const fileName = fileUrl.split('/uploads/').pop();
            return fileName ? path.join(localUploadDir, fileName) : null;
        }
        return null;
    }

    /**
     * STL to GLB conversion (simulated for prototype).
     */
    private async handleStlToGlb(asset: any) {
        // Implementation from previous turn, integrated with metadata updates
        const previewUrl = asset.fileUrl.replace('.stl', '.glb');
        const metadata = asset.metadata ? JSON.parse(asset.metadata) : {};
        metadata.previewUrl = previewUrl;

        await db.update(projectAssets)
            .set({ metadata: JSON.stringify(metadata) })
            .where(eq(projectAssets.id, asset.id));

        return { status: 'success', previewUrl };
    }

    /**
     * PCB DRC check (simulated for prototype).
     */
    private async handlePcbDRC(asset: any) {
        // Implementation from previous turn
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            status: 'warning',
            errors: 0,
            warnings: 2,
            results: { annotation: 'Annular ring warning at VIA_01' }
        };
    }
}

export default new RunnerService();
