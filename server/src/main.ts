import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
require('dotenv').config();
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
const express = require('express');
const path = require('path');
const app = express();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });
  // app.use(multer().any());
  app.use('/uploads/avatar', express.static(path.join(__dirname, '..', 'uploads', 'avatar')));
  await app.listen(3001);

  const prisma = new PrismaClient();
  const testUser = await prisma.user.findUnique({ where: { username: 'testUser' } });
  if (!testUser) {
    await prisma.user.create({
      data: {
        username: 'testUser',
        displayName: 'testUser',
        // add other required fields here
      },
    });
  }
}

bootstrap();
