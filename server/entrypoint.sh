#!/bin/sh

npm install
npx prisma migrate dev --name init

# npm run build

exec npm run start:dev