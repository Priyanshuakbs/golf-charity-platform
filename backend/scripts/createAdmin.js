const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
require('dotenv').config()

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected...')

   const User = require('../models/User')
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (existing) {
      console.log('Admin already exists:', existing.email)
      process.exit(0)
    }

    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    const admin = await User.create({
      name:     process.env.ADMIN_NAME,
      email:    process.env.ADMIN_EMAIL,
      password: hash,
      role:     'admin',
    })

    console.log('Admin created!')
    console.log('Email:', admin.email)
    console.log('Role: ', admin.role)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

run()