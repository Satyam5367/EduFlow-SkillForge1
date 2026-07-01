# ─── Build Stage ──────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build args for env variables
ARG REACT_APP_API_URL
ARG REACT_APP_RAZORPAY_KEY_ID

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_RAZORPAY_KEY_ID=$REACT_APP_RAZORPAY_KEY_ID
ENV CI=false

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Production Stage — nginx ─────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config for React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
