import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import Task from '../models/Task.js';
import Inventory from '../models/Inventory.js';
import Plant from '../models/Plant.js';
import Notification from '../models/Notification.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Branch.deleteMany({});
    await Task.deleteMany({});
    await Inventory.deleteMany({});
    await Plant.deleteMany({});
    await Notification.deleteMany({});

    // Create Branch
    console.log('🏢 Creating branches...');
    const branch = await Branch.create({
      name: 'Main Branch',
      code: 'MB001',
      address: {
        street: '123 Garden Street',
        city: 'Dubai',
        state: 'Dubai',
        zipCode: '12345',
        country: 'UAE'
      },
      phone: '+971501234567',
      email: 'main@garden.com',
      isActive: true
    });

    // Create Admin
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@garden.com',
      password: 'admin123',
      role: 'admin',
      phone: '+971501234567',
      isActive: true
    });

    // Create Workers
    console.log('👷 Creating workers...');
    const workers = await User.create([
      {
        name: 'Ahmed Ali',
        email: 'worker@garden.com',
        password: 'worker123',
        role: 'worker',
        phone: '+966501234568',
        branch: branch._id,
        isActive: true,
        workerDetails: {
          employeeId: 'W001',
          specialization: ['lawn-mowing', 'landscaping'],
          rating: 4.5,
          completedTasks: 25
        }
      },
      {
        name: 'Khalid Ibrahim',
        email: 'khalid@garden.com',
        password: 'worker123',
        role: 'worker',
        phone: '+966501234570',
        branch: branch._id,
        isActive: true,
        workerDetails: {
          employeeId: 'W002',
          specialization: ['irrigation', 'landscaping'],
          rating: 4.7,
          completedTasks: 30
        }
      },
      {
        name: 'Omar Hassan',
        email: 'omar@garden.com',
        password: 'worker123',
        role: 'worker',
        phone: '+966501234571',
        branch: branch._id,
        isActive: true,
        workerDetails: {
          employeeId: 'W003',
          specialization: ['tree-trimming', 'pest-control'],
          rating: 4.3,
          completedTasks: 20
        }
      }
    ]);

    // Create Clients
    console.log('🧑 Creating clients...');
    const clients = await Client.create([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        password: 'demo123',
        isPasswordTemporary: false,
        phone: '+971501234567',
        whatsapp: '+971501234567',
        address: {
          street: '123 Villa Street',
          city: 'Dubai',
          state: 'Dubai',
          zipCode: '12345',
          country: 'UAE'
        },
        propertyType: 'residential',
        propertySize: 500,
        branch: branch._id,
        status: 'active'
      },
      {
        name: 'Sarah Ahmed',
        email: 'sarah@example.com',
        username: 'sarah.ahmed',
        password: 'demo123',
        isPasswordTemporary: false,
        phone: '+971501234568',
        whatsapp: '+971501234568',
        address: {
          street: '456 Apartment Complex',
          city: 'Dubai',
          state: 'Dubai',
          zipCode: '12346',
          country: 'UAE'
        },
        propertyType: 'residential',
        propertySize: 300,
        branch: branch._id,
        status: 'active'
      }
    ]);

    // Create Plants
    console.log('🌱 Creating plants...');
    await Plant.create([
      {
        name: {
          ar: 'ورد جوري',
          en: 'Rose',
          bn: 'গোলাপ'
        },
        scientificName: 'Rosa damascena',
        category: 'flower',
        description: {
          ar: 'وردة جميلة ذات رائحة عطرة',
          en: 'Beautiful fragrant rose',
          bn: 'সুন্দর সুগন্ধি গোলাপ'
        },
        careInstructions: {
          watering: 'Water twice a week, keep soil moist',
          sunlight: 'Full sun, 6-8 hours daily',
          soil: 'Well-draining loamy soil',
          temperature: '15-25°C optimal'
        },
        growthRate: 'moderate',
        seasonality: ['spring', 'summer'],
        price: 25.50,
        stockQuantity: 100,
        unit: 'piece',
        isActive: true,
        tags: ['decorative', 'fragrant', 'popular']
      },
      {
        name: {
          ar: 'نخلة',
          en: 'Palm Tree',
          bn: 'তাল গাছ'
        },
        scientificName: 'Phoenix dactylifera',
        category: 'tree',
        description: {
          ar: 'نخلة مثمرة تنتج التمور',
          en: 'Date producing palm tree',
          bn: 'খেজুর উৎপাদনকারী তাল গাছ'
        },
        careInstructions: {
          watering: 'Deep watering once a week',
          sunlight: 'Full sun exposure',
          soil: 'Sandy, well-drained soil',
          temperature: '20-35°C'
        },
        growthRate: 'slow',
        seasonality: ['year-round'],
        price: 150.00,
        stockQuantity: 50,
        unit: 'piece',
        isActive: true,
        tags: ['fruit', 'desert', 'traditional']
      },
      {
        name: {
          ar: 'صبار',
          en: 'Cactus',
          bn: 'ক্যাকটাস'
        },
        scientificName: 'Cactaceae',
        category: 'succulent',
        description: {
          ar: 'نبات صحراوي يتحمل الجفاف',
          en: 'Desert plant that tolerates drought',
          bn: 'মরুভূমির উদ্ভিদ যা খরা সহ্য করে'
        },
        careInstructions: {
          watering: 'Water sparingly, once every 2 weeks',
          sunlight: 'Full sun to partial shade',
          soil: 'Sandy, well-draining cactus mix',
          temperature: '15-30°C'
        },
        growthRate: 'slow',
        seasonality: ['year-round'],
        price: 15.00,
        stockQuantity: 200,
        unit: 'pot',
        isActive: true,
        tags: ['low-maintenance', 'decorative', 'indoor']
      },
      {
        name: {
          ar: 'ياسمين',
          en: 'Jasmine',
          bn: 'জুঁই'
        },
        scientificName: 'Jasminum',
        category: 'flower',
        description: {
          ar: 'زهرة عطرية جميلة',
          en: 'Beautiful fragrant flower',
          bn: 'সুন্দর সুগন্ধি ফুল'
        },
        careInstructions: {
          watering: 'Regular watering, keep moist',
          sunlight: 'Full sun to partial shade',
          soil: 'Rich, well-draining soil',
          temperature: '18-28°C'
        },
        growthRate: 'fast',
        seasonality: ['spring', 'summer', 'fall'],
        price: 20.00,
        stockQuantity: 150,
        unit: 'piece',
        isActive: true,
        tags: ['fragrant', 'climbing', 'popular']
      },
      {
        name: {
          ar: 'نعناع',
          en: 'Mint',
          bn: 'পুদিনা'
        },
        scientificName: 'Mentha',
        category: 'herb',
        description: {
          ar: 'عشبة عطرية للطبخ',
          en: 'Aromatic herb for cooking',
          bn: 'রান্নার জন্য সুগন্ধি ভেষজ'
        },
        careInstructions: {
          watering: 'Keep soil consistently moist',
          sunlight: 'Partial shade to full sun',
          soil: 'Rich, moist soil',
          temperature: '15-25°C'
        },
        growthRate: 'fast',
        seasonality: ['year-round'],
        price: 10.00,
        stockQuantity: 300,
        unit: 'pot',
        isActive: true,
        tags: ['edible', 'aromatic', 'easy-to-grow']
      }
    ]);

    // Create Inventory
    console.log('📦 Creating inventory...');
    await Inventory.create([
      {
        name: 'Organic Fertilizer',
        category: 'fertilizer',
        sku: 'FERT-001',
        description: 'High quality organic fertilizer for all plants',
        unit: 'kg',
        branch: branch._id,
        quantity: {
          current: 100,
          minimum: 20,
          maximum: 500
        },
        price: {
          cost: 10,
          selling: 15
        },
        supplier: {
          name: 'Green Supplies Co.',
          contact: '+971501234567'
        }
      },
      {
        name: 'Lawn Mower',
        category: 'equipment',
        sku: 'EQUIP-001',
        description: 'Professional electric lawn mower',
        unit: 'piece',
        branch: branch._id,
        quantity: {
          current: 5,
          minimum: 2,
          maximum: 10
        },
        price: {
          cost: 500,
          selling: 700
        }
      },
      {
        name: 'Pesticide Spray',
        category: 'pesticide',
        sku: 'PEST-001',
        description: 'Eco-friendly pesticide spray',
        unit: 'liter',
        branch: branch._id,
        quantity: {
          current: 30,
          minimum: 10,
          maximum: 100
        },
        price: {
          cost: 20,
          selling: 30
        }
      }
    ]);

    // Create Tasks
    console.log('📋 Creating tasks...');
    const tasks = await Task.create([
      {
        title: 'Garden Maintenance - Villa',
        description: 'Complete garden maintenance including lawn mowing and hedge trimming',
        client: clients[0]._id,
        worker: workers[0]._id,
        branch: branch._id,
        status: 'assigned',
        priority: 'high',
        category: 'lawn-mowing',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedDuration: 3,
        location: {
          address: clients[0].address.street + ', ' + clients[0].address.city
        }
      },
      {
        title: 'Tree Trimming Service',
        description: 'Professional tree trimming for palm trees',
        client: clients[1]._id,
        worker: workers[2]._id,
        branch: branch._id,
        status: 'in-progress',
        priority: 'medium',
        category: 'tree-trimming',
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        estimatedDuration: 4,
        location: {
          address: clients[1].address.street + ', ' + clients[1].address.city
        },
        startedAt: new Date()
      },
      {
        title: 'Landscape Design',
        description: 'New landscape design and installation',
        client: clients[0]._id,
        branch: branch._id,
        status: 'pending',
        priority: 'low',
        category: 'landscaping',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedDuration: 8,
        location: {
          address: clients[0].address.street + ', ' + clients[0].address.city
        }
      }
    ]);

    // Create Notifications
    console.log('🔔 Creating notifications...');
    await Notification.create([
      {
        recipient: {
          type: 'user',
          id: workers[0]._id
        },
        type: 'task-assigned',
        channel: 'email',
        subject: 'New Task Assigned',
        message: `You have been assigned a new task: ${tasks[0].title}`,
        data: {
          taskId: tasks[0]._id,
          taskTitle: tasks[0].title
        },
        status: {
          email: {
            sent: true,
            sentAt: new Date()
          }
        },
        priority: 'high',
        read: false
      },
      {
        recipient: {
          type: 'user',
          id: workers[2]._id
        },
        type: 'task-assigned',
        channel: 'email',
        subject: 'New Task Assigned',
        message: `You have been assigned a new task: ${tasks[1].title}`,
        data: {
          taskId: tasks[1]._id,
          taskTitle: tasks[1].title
        },
        status: {
          email: {
            sent: true,
            sentAt: new Date()
          }
        },
        priority: 'high',
        read: false
      },
      {
        recipient: {
          type: 'user',
          id: admin._id
        },
        type: 'other',
        channel: 'email',
        subject: 'System Update',
        message: 'Database seeded successfully with demo data',
        data: {},
        status: {
          email: {
            sent: true,
            sentAt: new Date()
          }
        },
        priority: 'low',
        read: false
      }
    ]);

    console.log('✅ Seed completed successfully!');
    console.log(`
📊 Created:
  - 1 Branch
  - 1 Admin
  - 3 Workers
  - 2 Clients
  - 5 Plants
  - 3 Inventory Items
  - 3 Tasks
  - 3 Notifications

🔑 Login Credentials:
  Admin: admin@garden.com / admin123
  Worker: worker@garden.com / worker123
  Client: john.doe@example.com / demo123
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();