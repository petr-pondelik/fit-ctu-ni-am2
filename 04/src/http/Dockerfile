# The image which that image is built on
FROM node:14

# Application repository within the repository
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port on which the server is listening
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]