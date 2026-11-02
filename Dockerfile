# Build stage: same steps as the CI pipeline
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage: unprivileged nginx, Rahti runs containers as a non-root user
FROM nginxinc/nginx-unprivileged:stable-alpine
# The image fills in ${BACKEND_URL} from templates/ at startup
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Default backend: turva-back on Rahti
ENV BACKEND_URL=https://turva-back-turva-back.2.rahtiapp.fi
EXPOSE 8080
