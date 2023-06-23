# pull official base image
FROM node:14

# set working directory
WORKDIR /app

# install app dependencies
#copies package.json and package-lock.json to Docker environment
COPY package.json ./
COPY package-lock.json ./
# Installs all node packages
RUN npm install 

# Copies everything over to Docker environment
COPY . ./

EXPOSE 8080

# start app
CMD ["npm", "start"]