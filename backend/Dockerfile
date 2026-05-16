FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Bundle app source
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build typescript
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
