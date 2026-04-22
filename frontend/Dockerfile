FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=http://localhost:8080/v1/api
ARG VITE_MFE_TRANSACTIONS_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MFE_TRANSACTIONS_URL=$VITE_MFE_TRANSACTIONS_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
