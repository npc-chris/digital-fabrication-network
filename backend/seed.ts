import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { hash } from 'bcrypt';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('🌱 Starting database seeding...');

    // Hash password for test users
    const hashedPassword = await hash('password123', 10);

    // 1. Create test users (explorers and providers)
    console.log('Creating users...');
    
    const explorerUsers = [
      { email: 'explorer1@test.com', firstName: 'John', lastName: 'Smith', location: 'Lagos' },
      { email: 'explorer2@test.com', firstName: 'Sarah', lastName: 'Johnson', location: 'Abuja' },
      { email: 'explorer3@test.com', firstName: 'Michael', lastName: 'Brown', location: 'Port Harcourt' },
    ];

    const providerUsers = [
      {
        email: 'provider1@test.com',
        firstName: 'David',
        lastName: 'Williams',
        company: 'TechParts Nigeria',
        location: 'Lagos',
        bio: 'Leading supplier of electronic components and parts in Nigeria. Over 10 years of experience.',
        role: 'provider',
      },
      {
        email: 'provider2@test.com',
        firstName: 'Emily',
        lastName: 'Davis',
        company: '3D Print Hub',
        location: 'Abuja',
        bio: 'Professional 3D printing and rapid prototyping services. Fast turnaround times.',
        role: 'provider',
      },
      {
        email: 'provider3@test.com',
        firstName: 'James',
        lastName: 'Wilson',
        company: 'MakerSpace Pro',
        location: 'Lagos',
        bio: 'Full-service fabrication lab offering CNC machining, laser cutting, and PCB assembly.',
        role: 'provider',
      },
      {
        email: 'provider4@test.com',
        firstName: 'Linda',
        lastName: 'Martinez',
        company: 'Electronics Supply Co',
        location: 'Ibadan',
        bio: 'Wholesale and retail electronics components. Specializing in Arduino, Raspberry Pi, and IoT parts.',
        role: 'provider',
      },
    ];

    const userIds = { explorers: [], providers: [] };

    for (const explorer of explorerUsers) {
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, is_verified, onboarding_completed) 
         VALUES ($1, $2, 'explorer', true, true) RETURNING id`,
        [explorer.email, hashedPassword]
      );
      const userId = userResult.rows[0].id;
      userIds.explorers.push(userId);

      await client.query(
        `INSERT INTO profiles (user_id, first_name, last_name, location) 
         VALUES ($1, $2, $3, $4)`,
        [userId, explorer.firstName, explorer.lastName, explorer.location]
      );
    }

    for (const provider of providerUsers) {
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, is_verified, onboarding_completed, provider_approved) 
         VALUES ($1, $2, $3, true, true, true) RETURNING id`,
        [provider.email, hashedPassword, provider.role]
      );
      const userId = userResult.rows[0].id;
      userIds.providers.push(userId);

      await client.query(
        `INSERT INTO profiles (user_id, first_name, last_name, company, location, bio, rating, review_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, provider.firstName, provider.lastName, provider.company, provider.location, provider.bio, '4.50', 12]
      );
    }

    console.log(`✓ Created ${explorerUsers.length} explorers and ${providerUsers.length} providers`);

    // 2. Create components
    console.log('Creating components...');
    
    const components = [
      {
        providerId: userIds.providers[0],
        name: 'Arduino Uno R3',
        description: 'Original Arduino Uno R3 microcontroller board with ATmega328P chip. Perfect for beginners and prototyping.',
        type: 'electrical',
        price: 25.99,
        availability: 50,
        location: 'Lagos',
        rating: '4.8',
        reviewCount: 25,
        images: JSON.stringify(['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400']),
      },
      {
        providerId: userIds.providers[0],
        name: 'Raspberry Pi 4 Model B - 4GB',
        description: 'Latest Raspberry Pi with 4GB RAM. Ideal for IoT projects, media centers, and learning programming.',
        type: 'electrical',
        price: 55.00,
        availability: 30,
        location: 'Lagos',
        rating: '4.9',
        reviewCount: 18,
        images: JSON.stringify(['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400']),
      },
      {
        providerId: userIds.providers[3],
        name: 'Servo Motor SG90',
        description: 'Micro servo motor with 180-degree rotation. Lightweight and compatible with Arduino.',
        type: 'mechanical',
        price: 3.50,
        availability: 100,
        location: 'Ibadan',
        rating: '4.5',
        reviewCount: 42,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[3],
        name: 'Breadboard 830 Points',
        description: 'Solderless breadboard for prototyping circuits. 830 tie points with power rails.',
        type: 'electrical',
        price: 5.99,
        availability: 75,
        location: 'Ibadan',
        rating: '4.6',
        reviewCount: 35,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[0],
        name: 'PLA Filament 1.75mm - 1kg',
        description: 'High-quality PLA filament for 3D printing. Multiple colors available. Low warping.',
        type: 'materials',
        price: 22.00,
        availability: 40,
        location: 'Lagos',
        rating: '4.7',
        reviewCount: 28,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[3],
        name: 'Jumper Wire Set (120pcs)',
        description: 'Assorted male-to-male, male-to-female, and female-to-female jumper wires.',
        type: 'consumables',
        price: 8.50,
        availability: 60,
        location: 'Ibadan',
        rating: '4.4',
        reviewCount: 50,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
    ];

    for (const component of components) {
      await client.query(
        `INSERT INTO components (provider_id, name, description, type, price, availability, location, rating, review_count, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          component.providerId,
          component.name,
          component.description,
          component.type,
          component.price,
          component.availability,
          component.location,
          component.rating,
          component.reviewCount,
          component.images,
        ]
      );
    }

    console.log(`✓ Created ${components.length} components`);

    // 3. Create services
    console.log('Creating services...');
    
    const services = [
      {
        providerId: userIds.providers[1],
        name: 'FDM 3D Printing Service',
        description: 'High-quality FDM 3D printing with PLA, ABS, and PETG materials. Build volume: 300x300x400mm.',
        category: '3D printing',
        pricingModel: 'per_unit',
        pricePerUnit: 0.15,
        leadTime: 3,
        location: 'Abuja',
        rating: '4.9',
        reviewCount: 35,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[2],
        name: 'CNC Milling Service',
        description: 'Precision CNC milling for metal and plastic parts. 3-axis and 5-axis machines available.',
        category: 'CNC machining',
        pricingModel: 'hourly',
        pricePerUnit: 75.00,
        leadTime: 5,
        location: 'Lagos',
        rating: '4.8',
        reviewCount: 22,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[2],
        name: 'PCB Assembly Service',
        description: 'Professional PCB assembly and soldering. SMD and through-hole components. Quality testing included.',
        category: 'PCB assembly',
        pricingModel: 'per_unit',
        pricePerUnit: 50.00,
        leadTime: 7,
        location: 'Lagos',
        rating: '4.7',
        reviewCount: 18,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[1],
        name: 'Laser Cutting & Engraving',
        description: 'CO2 laser cutting for wood, acrylic, and cardboard. Precision engraving on various materials.',
        category: 'Rapid prototyping',
        pricingModel: 'per_unit',
        pricePerUnit: 30.00,
        leadTime: 2,
        location: 'Abuja',
        rating: '4.8',
        reviewCount: 28,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
      {
        providerId: userIds.providers[2],
        name: 'Electronics Lab Access',
        description: 'Hourly access to fully equipped electronics lab. Oscilloscopes, soldering stations, and test equipment.',
        category: 'Electronics lab',
        pricingModel: 'hourly',
        pricePerUnit: 15.00,
        leadTime: 1,
        location: 'Lagos',
        rating: '4.6',
        reviewCount: 45,
        images: JSON.stringify(['https://images.unsplash.com/photo-1581092918484-8313e1f6d5c7?w=400']),
      },
    ];

    for (const service of services) {
      await client.query(
        `INSERT INTO services (provider_id, name, description, category, pricing_model, price_per_unit, lead_time, location, rating, review_count, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          service.providerId,
          service.name,
          service.description,
          service.category,
          service.pricingModel,
          service.pricePerUnit,
          service.leadTime,
          service.location,
          service.rating,
          service.reviewCount,
          service.images,
        ]
      );
    }

    console.log(`✓ Created ${services.length} services`);

    // 4. Create community posts
    console.log('Creating community posts...');
    
    const posts = [
      {
        authorId: userIds.explorers[0],
        title: 'Looking for affordable PCB fabrication in Lagos',
        content: 'Hi everyone! I\'m working on a small IoT project and need to fabricate about 10 PCBs. Does anyone know a reliable and affordable PCB fabrication service in Lagos? Looking for quick turnaround (less than a week). Thanks!',
        category: 'fabrication_request',
        status: 'open',
        viewCount: 45,
      },
      {
        authorId: userIds.providers[2],
        title: 'New CNC Machining Service Now Available!',
        content: 'Excited to announce that we\'ve added a new 5-axis CNC machine to our workshop! We can now handle more complex geometries and tighter tolerances. Special introductory pricing for the first month. Check out our services page for more details.',
        category: 'innovation',
        status: 'open',
        viewCount: 78,
      },
      {
        authorId: userIds.explorers[1],
        title: 'Arduino vs Raspberry Pi for Home Automation?',
        content: 'I\'m planning to build a smart home automation system. Should I go with Arduino or Raspberry Pi? My requirements include controlling lights, fans, and monitoring temperature/humidity. What would you recommend and why?',
        category: 'challenge',
        status: 'open',
        viewCount: 120,
      },
      {
        authorId: userIds.providers[1],
        title: 'Collaboration Opportunity: 3D Printing Workshop',
        content: 'We\'re organizing a beginner-friendly 3D printing workshop next month in Abuja. Looking for co-organizers and sponsors. The workshop will cover basics of 3D modeling, slicing, and printing. Interested parties please reach out!',
        category: 'partnership',
        status: 'open',
        viewCount: 92,
      },
      {
        authorId: userIds.explorers[2],
        title: 'Completed my first robotics project!',
        content: 'Just finished building my first Arduino-based line-following robot. It took me 3 weeks but I learned so much! Big thanks to this community for all the help and resources. Happy to share my code and circuit diagrams with anyone interested.',
        category: 'innovation',
        status: 'closed',
        viewCount: 156,
      },
      {
        authorId: userIds.explorers[0],
        title: 'Where to buy quality servo motors in bulk?',
        content: 'Working on a project that requires about 20 servo motors (SG90 or similar). Does anyone know where I can buy them in bulk at a good price? Preferably in Lagos or online with reasonable shipping.',
        category: 'fabrication_request',
        status: 'in_progress',
        viewCount: 63,
      },
    ];

    for (const post of posts) {
      await client.query(
        `INSERT INTO community_posts (author_id, title, content, category, status, view_count) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [post.authorId, post.title, post.content, post.category, post.status, post.viewCount]
      );
    }

    console.log(`✓ Created ${posts.length} community posts`);

    // 5. Create some notifications for users
    console.log('Creating notifications...');
    
    const notifications = [
      {
        userId: userIds.explorers[0],
        type: 'reply',
        title: 'New reply to your post',
        message: 'Someone replied to your post "Looking for affordable PCB fabrication in Lagos"',
        relatedType: 'post',
        relatedId: 1,
        isRead: false,
      },
      {
        userId: userIds.providers[0],
        type: 'order',
        title: 'New order received',
        message: 'You have received a new order for Arduino Uno R3',
        relatedType: 'component',
        relatedId: 1,
        isRead: false,
      },
    ];

    for (const notification of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, related_type, related_id, is_read) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          notification.relatedType,
          notification.relatedId,
          notification.isRead,
        ]
      );
    }

    console.log(`✓ Created ${notifications.length} notifications`);

    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${explorerUsers.length} explorers`);
    console.log(`   - ${providerUsers.length} providers`);
    console.log(`   - ${components.length} components`);
    console.log(`   - ${services.length} services`);
    console.log(`   - ${posts.length} community posts`);
    console.log(`   - ${notifications.length} notifications`);
    console.log('\n🔑 Test credentials (all passwords: password123):');
    console.log('   Explorers: explorer1@test.com, explorer2@test.com, explorer3@test.com');
    console.log('   Providers: provider1@test.com, provider2@test.com, provider3@test.com, provider4@test.com');
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
