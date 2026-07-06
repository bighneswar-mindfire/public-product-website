FROM node:20-alpine AS base

# install dependencies
FROM base AS build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci
WORKDIR /opt/app
COPY . .
ENV NODE_ENV=production
RUN npm run build

#production
FROM base AS runner
RUN apk add --no-cache vips-dev
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
WORKDIR /opt/app
COPY --from=build /opt/app ./
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]