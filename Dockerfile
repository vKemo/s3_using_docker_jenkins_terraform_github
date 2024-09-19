#Use a Node.js as a base image

FROM node:19-alpine

#Set the working directory

WORKDIR /app

#Copy package.json and package-lock.json to the work directory

COPY package.json ./
COPY package-lock.json ./

#Install dependencies

RUN npm install

#Copy the rest of your app's source code

COPY . .

#Build the React app

RUN npm run build

#Use a new stage for serving the app

FROM node:19-alpine

#Set the working directory

WORKDIR /app

#Copy built files from the previous stage

COPY --from=build /app/build ./build

#Copy server.js and package.json

COPY server.js ./
COPY package.json ./

#Install only production dependencies

RUN npm install --only=production

#Expose the port the app runs on

EXPOSE 3000

#Command to run the server

CMD ["node", "server.js"]
