import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserFromDatabase(username: string) {
  if (!username) {
    return false;
  }
  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });
  if (!user) {
    return false;
  }
  return user;
}

export async function isTwoFactorEnabled(username: string) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: {
      twofactor: true,
    },
  });
  if (!user) {
    return 'factor not enabled';
  }
  return user.twofactor;
}

export async function twoFactorOn(username: string) {
  const user = await prisma.user.update({
    where: {
      username: username,
    },
    data: {
      twofactor: true,
    },
  });
  return user;
}

