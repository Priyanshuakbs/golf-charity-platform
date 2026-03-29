/**
 * seedCharities.js
 * Run this ONCE to populate charities in MongoDB.
 *
 * Usage:
 *   cd backend
 *   node utils/seedCharities.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Charity = require('../models/Charity');

const charities = [
  {
    name: 'Golf Foundation',
    slug: 'golf-foundation',
    description: 'The Golf Foundation is the UK\'s leading golf charity, helping young people from all backgrounds to discover and enjoy golf. We run programmes in schools, communities and clubs to make golf accessible to everyone.',
    shortDescription: 'Making golf accessible to young people across the UK.',
    category: 'sports',
    isFeatured: true,
    isActive: true,
    totalReceived: 15420,
    subscriberCount: 48,
  },
  {
    name: 'Cancer Research UK',
    slug: 'cancer-research-uk',
    description: 'Cancer Research UK is the world\'s leading cancer research charity. Together with our partners and supporters, our work saves lives. We fund scientists, doctors and nurses, and we are making progress every day.',
    shortDescription: 'The world\'s leading cancer research charity saving lives daily.',
    category: 'health',
    isFeatured: true,
    isActive: true,
    totalReceived: 32100,
    subscriberCount: 92,
  },
  {
    name: 'Trees for Life',
    slug: 'trees-for-life',
    description: 'Trees for Life is an award-winning Scottish charity working to rewild the Highlands of Scotland. We plant and protect native trees, restore wild land and work with communities to create a future where people and nature thrive together.',
    shortDescription: 'Rewilding the Scottish Highlands one tree at a time.',
    category: 'environment',
    isFeatured: true,
    isActive: true,
    totalReceived: 8750,
    subscriberCount: 31,
  },
  {
    name: 'Street League',
    slug: 'street-league',
    description: 'Street League uses the power of sport to transform the lives of young people facing unemployment. Our sport and employability programmes help young people across the UK to build the skills, confidence and network they need to find work.',
    shortDescription: 'Using sport to help unemployed young people find work.',
    category: 'community',
    isFeatured: false,
    isActive: true,
    totalReceived: 5300,
    subscriberCount: 19,
  },
  {
    name: 'literacy Trust',
    slug: 'national-literacy-trust',
    description: 'The National Literacy Trust is an independent charity that transforms lives through literacy. We support schools, libraries and community organisations to improve reading, writing and communication skills for children and families.',
    shortDescription: 'Transforming lives by improving literacy across the UK.',
    category: 'education',
    isFeatured: false,
    isActive: true,
    totalReceived: 4200,
    subscriberCount: 14,
  },
  {
    name: 'Mind',
    slug: 'mind-mental-health',
    description: 'Mind provides advice and support to empower anyone experiencing a mental health problem. We campaign to improve services, raise awareness, and promote understanding. We won\'t give up until everyone experiencing a mental health problem gets support.',
    shortDescription: 'Supporting everyone experiencing a mental health problem.',
    category: 'health',
    isFeatured: false,
    isActive: true,
    totalReceived: 11800,
    subscriberCount: 37,
  },
  {
    name: 'Habitat for Humanity',
    slug: 'habitat-for-humanity',
    description: 'Habitat for Humanity Great Britain works to tackle the housing crisis by bringing communities together to help people build or improve a place they can call home. We believe that affordable housing is a foundation for a better life.',
    shortDescription: 'Building homes and communities for a better tomorrow.',
    category: 'community',
    isFeatured: false,
    isActive: true,
    totalReceived: 6900,
    subscriberCount: 22,
  },
  {
    name: 'WWF UK',
    slug: 'wwf-uk',
    description: 'WWF is one of the world\'s largest and most respected independent conservation organisations. Our mission is to stop the degradation of the planet\'s natural environment and to build a future in which humans live in harmony with nature.',
    shortDescription: 'Protecting our planet\'s natural environment for future generations.',
    category: 'environment',
    isFeatured: false,
    isActive: true,
    totalReceived: 9400,
    subscriberCount: 28,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const existing = await Charity.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} charities already exist.`);
      console.log('   Delete them from MongoDB first if you want to re-seed.');
      process.exit(0);
    }

    await Charity.insertMany(charities);
    console.log(`✅ ${charities.length} charities seeded successfully!`);
    charities.forEach(c => console.log(`   - ${c.name} (${c.category})`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();