FROM node:20-alpine

# ติดตั้ง openssl และ libc6-compat สำหรับ Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# สั่ง generate โดยอ้างอิงจาก binaryTargets ใน schema.prisma
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node index.js"]