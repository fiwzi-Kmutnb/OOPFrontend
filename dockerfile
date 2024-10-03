FROM node:latest

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

ENV NEXT_PUBLIC_API_URL=http://89.213.177.204:5000
ENV NEXT_PUBLIC_DCM_API_URL=http://89.213.177.204:5000/image?filename=

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
