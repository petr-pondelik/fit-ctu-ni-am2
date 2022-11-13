# The image which that image is built on
FROM node:14

# Application repository within the repository
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Expose port on which the server is listening
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]