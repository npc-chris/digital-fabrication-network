import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { hash } from 'bcrypt';
import { COMPONENT_CATEGORIES } from './src/config/componentCategories';

dotenv.config();

const connectionString = process.env.SEED_DB_URL;
const requiresSsl =
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  (connectionString?.includes('sslmode=require') ?? false) ||
  (connectionString?.includes('neon.tech') ?? false);

if (!connectionString) {
  console.error('❌ SEED_DB_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting database seeding...');

    // 0. Clean old data (optional, but good for a fresh seed)
    // await client.query('TRUNCATE users, profiles, components, services, community_posts, notifications RESTART IDENTITY CASCADE');

    // 0.1 Seed Categories, Subcategories, and Applications
    console.log('Seeding component categories...');
    const applicationMap = new Map<string, number>();

    for (const category of COMPONENT_CATEGORIES) {
      await client.query(
        `INSERT INTO component_categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [category.id, category.name]
      );

      for (const subcategory of category.subcategories) {
        await client.query(
          `INSERT INTO component_subcategories (id, category_id, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [subcategory.id, category.id, subcategory.name]
        );

        if (subcategory.applications) {
          for (const appName of subcategory.applications) {
            let appId: number;
            const existingApp = await client.query(
              `SELECT id FROM component_applications WHERE subcategory_id = $1 AND name = $2`,
              [subcategory.id, appName]
            );

            if (existingApp.rows.length > 0) {
              appId = existingApp.rows[0].id;
            } else {
              const newApp = await client.query(
                `INSERT INTO component_applications (subcategory_id, name) VALUES ($1, $2) RETURNING id`,
                [subcategory.id, appName]
              );
              appId = newApp.rows[0].id;
            }
            applicationMap.set(`${subcategory.id}:${appName}`, appId);
          }
        }
      }
    }

    // 1. Forums Hierarchy
    console.log('Seeding forum categories...');
    const forumCategories = [
      { name: 'General Discussion', description: 'Talk about anything related to digital fabrication', icon: 'MessagesSquare', order: 1 },
      { name: '3D Printing', description: 'FDM, Resin, Slicing, and Post-processing', icon: 'Box', order: 2 },
      { name: 'PCB Design & Assembly', description: 'Schematics, Layouts, and STM32/ESP32 development', icon: 'Cpu', order: 3 },
      { name: 'CNC & Machining', description: 'Milling, Lathe, and G-Code optimization', icon: 'Settings', order: 4 },
      { name: 'Robotics & Mechatronics', description: 'Building robots and automation systems', icon: 'Zap', order: 5 },
      { name: 'Showcase', description: 'Show off your completed hardware projects', icon: 'Trophy', order: 6 },
    ];

    const forumCatIds: number[] = [];
    for (const cat of forumCategories) {
      const res = await client.query(
        `INSERT INTO forum_categories (name, description, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
        [cat.name, cat.description, cat.icon, cat.order]
      );
      forumCatIds.push(res.rows[0].id);
    }

    // 2. Users & Identities
    console.log('Creating users...');
    const hashedPassword = await hash('password123', 10);
    const adminPassword = await hash('admin123!@#', 10);

    // Admin
    const adminRes = await client.query(
      `INSERT INTO users (email, password, role, is_verified, onboarding_completed) VALUES ($1, $2, 'admin', true, true) RETURNING id`,
      ['admin@dfn.ng', adminPassword]
    );
    const adminId = adminRes.rows[0].id;

    // Providers (Tech Hubs)
    const providerList = [
      { email: 'nerdshed@test.com', name: 'Nerdshed Africa', company: 'Nerdshed Ltd', location: 'Yaba, Lagos', bio: 'Premier hardware development hub and electronics supply in Lagos.' },
      { email: 'makerspace@test.com', name: 'Makerspace Pro', company: 'Pro Maker Services', location: 'V/I, Lagos', bio: 'Specializing in CNC machining and high-end PCB assembly.' },
      { email: 'fab_aba@test.com', name: 'Aba Fab Lab', company: 'Innovation Center Aba', location: 'Aba, Abia', bio: 'Digital fabrication center supporting eastern region engineers.' },
    ];

    const providerIds: number[] = [];
    for (const p of providerList) {
      const res = await client.query(
        `INSERT INTO users (email, password, role, is_verified, onboarding_completed, provider_approved) VALUES ($1, $2, 'provider', true, true, true) RETURNING id`,
        [p.email, hashedPassword]
      );
      const pid = res.rows[0].id;
      providerIds.push(pid);
      await client.query(
        `INSERT INTO profiles (user_id, first_name, last_name, company, location, bio, rating, review_count, is_mentor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [pid, p.name.split(' ')[0], p.name.split(' ')[1] || '', p.company, p.location, p.bio, '4.95', 42, true]
      );
    }

    // Explorers (Users)
    const explorerEmails = ['tunde@test.com', 'chioma@test.com', 'ibrahim@test.com'];
    const explorerIds: number[] = [];
    for (const email of explorerEmails) {
      const res = await client.query(
        `INSERT INTO users (email, password, role, is_verified, onboarding_completed) VALUES ($1, $2, 'explorer', true, true) RETURNING id`,
        [email, hashedPassword]
      );
      explorerIds.push(res.rows[0].id);
      await client.query(
        `INSERT INTO profiles (user_id, first_name, location) VALUES ($1, $2, $3)`,
        [res.rows[0].id, email.split('@')[0], 'Lagos, Nigeria']
      );
    }

    // 3. Components & Affiliate Stores
    console.log('Seeding components and affiliate stores...');

    const storeRes = await client.query(
      `INSERT INTO affiliate_stores (user_id, store_name, supplier_type, website, is_active, is_approved) VALUES ($1, $2, $3, $4, true, true) RETURNING id`,
      [adminId, 'Mouser International', 'international', 'https://mouser.com']
    );
    const storeId = storeRes.rows[0].id;

    const components = [
      { providerId: providerIds[0], name: 'ESP32-S3-WROOM-1', type: 'electrical', sub: 'microcontrollers', app: 'ESP32', price: 8.50, loc: 'Yaba, Lagos', stock: 120, images: ['https://cdn.sparkfun.com//assets/parts/2/0/2/0/2/19356-01.jpg'] },
      { providerId: providerIds[0], name: 'Arduino Nano Every', type: 'electrical', sub: 'microcontrollers', app: 'Arduino', price: 12.00, loc: 'Yaba, Lagos', stock: 50, images: ['https://m.media-amazon.com/images/I/71uVInW49LL.jpg'] },
      { providerId: providerIds[1], name: 'NEMA 17 Stepper Motor', type: 'mechanical', sub: 'motors', app: 'Stepper Motors', price: 25.0, loc: 'V/I, Lagos', stock: 15, images: ['https://m.media-amazon.com/images/I/61NlUoQY98L.jpg'] },
      // Affiliate component
      { providerId: adminId, name: 'STM32F405RG', type: 'electrical', sub: 'microcontrollers', app: 'STM32', price: 9.20, loc: 'International', stock: 1000, isAffiliate: true, storeId, externalUrl: 'https://mouser.com/stm32f405' },
    ];

    const componentIds: number[] = [];
    for (const c of components) {
      const appId = applicationMap.get(`${c.sub}:${c.app}`);
      const res = await client.query(
        `INSERT INTO components (provider_id, name, type, subcategory_id, application_id, price, availability, location, images, is_affiliate, affiliate_store_id, external_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [c.providerId, c.name, c.type, c.sub, appId, c.price, c.stock, c.loc, JSON.stringify(c.images), c.isAffiliate || false, c.storeId || null, c.externalUrl || null]
      );
      componentIds.push(res.rows[0].id);
    }

    // 4. Projects & Versioning (Phase 4)
    console.log('Seeding Phase 4 engineering projects...');

    const projects = [
      { authorId: explorerIds[0], title: 'Smart Solar Inverter 3KW', desc: 'Hybrid solar inverter with IoT monitoring via ESP32. Includes complete PCB files and 3D enclosure designs.', category: 'power', difficulty: 'advanced' },
      { authorId: explorerIds[1], title: 'Mini-Quad X4 Drone', desc: 'Open-source 250mm racing drone frame and flight controller integration guide.', category: 'robotics', difficulty: 'intermediate' },
    ];

    for (const p of projects) {
      const res = await client.query(
        `INSERT INTO projects (author_id, title, description, category, difficulty) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [p.authorId, p.title, p.desc, p.category, p.difficulty]
      );
      const projectId = res.rows[0].id;

      // Add BOM Items
      await client.query(
        `INSERT INTO project_boms (project_id, component_name, component_id, quantity, notes) VALUES ($1, $2, $3, $4, $5)`,
        [projectId, 'ESP32 Controller', componentIds[0], 1, 'Main logic controller']
      );

      // Add Assets (Versioning)
      const assetRes = await client.query(
        `INSERT INTO project_assets (project_id, file_name, file_url, file_type, hardware_format, commit_message, version) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [projectId, 'Enclosure_V1.stl', '/uploads/mock-drone-body.stl', '.stl', '3d_model', 'Initial enclosure design', 1]
      );
      const assetId = assetRes.rows[0].id;

      // Add Build Pipeline
      const pipeRes = await client.query(
        `INSERT INTO build_pipelines (project_id, name, definition) VALUES ($1, $2, $3) RETURNING id`,
        [projectId, 'Enclosure Validation', JSON.stringify([
          { type: 'validate_pcb', params: {} },
          { type: 'generate_3d_preview', params: {} }
        ])]
      );
      const pipelineId = pipeRes.rows[0].id;

      // Add Pipeline Execution
      await client.query(
        `INSERT INTO pipeline_executions (pipeline_id, asset_id, trigger_user_id, status, progress) VALUES ($1, $2, $3, $4, $5)`,
        [pipelineId, assetId, p.authorId, 'completed', 100]
      );
    }

    // 5. Services & Mentorship
    console.log('Seeding services and mentorship...');

    // Services
    await client.query(
      `INSERT INTO services (provider_id, name, description, category, pricing_model, price_per_unit, location) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [providerIds[1], 'Professional PCB Assembly (PCBA)', 'SMT and THT assembly for prototype and small batch. ISO certified.', 'PCB assembly', 'per_unit', 45.00, 'VI, Lagos']
    );

    // Mentorship
    await client.query(
      `INSERT INTO mentorship_requests (mentee_id, mentor_id, topic, description, status) VALUES ($1, $2, $3, $4, $5)`,
      [explorerIds[2], providerIds[0], 'Hardware Monetization', 'Seeking advice on how to mass produce my smart socket in Aba.', 'matched']
    );

    // 6. Orders, Escrow & Logistics
    console.log('Seeding orders and logistics...');

    const quoteRes = await client.query(
      `INSERT INTO quotes (service_id, user_id, provider_id, project_description, status, estimated_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [1, explorerIds[0], providerIds[1], 'Assembly of 5 drone controller boards', 'approved', '225.00']
    );
    const quoteId = quoteRes.rows[0].id;

    const orderRes = await client.query(
      `INSERT INTO orders (explorer_id, provider_id, quote_id, total_price, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [explorerIds[0], providerIds[1], quoteId, '225.00', 'in_production', 'escrowed']
    );
    const orderId = orderRes.rows[0].id;

    // Logistics Tracking
    const trackingSteps = [
      { status: 'ordered', loc: 'Lagos Hub', desc: 'Order confirmed and funds locked.' },
      { status: 'in_production', loc: 'Provider Workshop', desc: 'PCB components sourced and pick-place programmed.' },
    ];
    for (const step of trackingSteps) {
      await client.query(
        `INSERT INTO order_tracking (order_id, status, location, description) VALUES ($1, $2, $3, $4)`,
        [orderId, step.status, step.loc, step.desc]
      );
    }

    // 7. Verification Documents
    await client.query(
      `INSERT INTO verification_documents (user_id, document_type, document_url, status) VALUES ($1, $2, $3, $4)`,
      [providerIds[0], 'business_license', 'https://dfn.ng/docs/nerdshed_cac.pdf', 'verified']
    );

    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`- ${providerIds.length} Providers (High-quality tech hubs)`);
    console.log(`- ${explorerIds.length} Explorers`);
    console.log(`- ${componentIds.length} Marketplace Components (Local + Affiliate)`);
    console.log(`- 2 Engineering Projects with Phase 4 Versioning & Pipelines`);
    console.log(`- 1 Order in Escrow with Logistics Tracking`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
