import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../src/modules/users/schemas/user.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  const adminEmail = 'admin@printcraft.com';
  const adminPassword = 'AdminPassword@123';
  
  const existingAdmin = await userModel.findOne({ email: adminEmail });
  
  if (existingAdmin) {
    console.log('Admin user already exists');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await userModel.create({
      name: 'Admin User',
      email: adminEmail,
      passwordHash: passwordHash,
      phone: '9999999999',
      role: 'admin',
      emailVerified: true,
    });
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  }

  await app.close();
}

seed().catch(err => {
  console.error('❌ Error seeding admin:', err);
  process.exit(1);
});
