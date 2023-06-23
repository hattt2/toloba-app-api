# Toloba App

A backend application for toloba ujjain.

## How to Run

You will have to follow some steps to test the API.

### 1 - Install MongoDB

To run this project, you need to install the latest version of MongoDB Community Edition first.

[https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)

### 2 - Install Node.js

Download and install Node.js. Make sure to download and install the latest stable version (LTS).

[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

To check if Node.js was installed succesfully, run the following command in terminal or command prompt:

`node --version`

You should see an output like this:

`v10.13.0`

It indicates that Node.js is running.

### 3 - Install the API Dependencies

Open the project folder using the terminal or command prompt, then type the following:

`npm i`

The command above will install all node modules needed for the API to run. If you are using Linux or MacOS and receive a permission denied message, use `sudo`.

### 4 - Set the Environment Variables

`cp .env.example .env`

### 5 - Running the Server

After following all steps above, you are ready to start the server. Type the following in the terminal or command prompt:

`node index.js`

This is going to run the application on port 3001. If this port is busy, the API will run in a different port. You can check the output to see in which port the API is running.
