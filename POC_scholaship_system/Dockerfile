FROM node:20-alpine

WORKDIR /app

# ก๊อปปี้ package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# ก๊อปปี้โค้ดทั้งหมด
COPY . .

# เปิดพอร์ตสำหรับ Vite (3000)
EXPOSE 3000

# รัน Development Server ของ Vite (กำหนด host เพื่อให้รับ traffic จากนอก container ได้)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]