# Cloud-Native Web Application

This is a cloud-native web application designed to run on cloud computing architecture, specifically optimized for deployment on Ubuntu 24.04 LTS. 

## Prerequisites

Before building and deploying the application, ensure you have the following installed:

- **Server Operating System**: Ubuntu 24.04 LTS
- **Programming Language**: 
  - Choose from: Node.js
- **Relational Database**: 
  - PostgreSQL (MongoDB, MSSQL, Oracle, etc., are not supported)
- **Backend Framework**: 
  - Any open-source framework such as:
    - Node.js: Express
- **ORM Framework**:
  - JavaScript: [Sequelize](https://sequelize.org/)

## Build Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/VishalPrasanna11/webapp
   cd webapp
   ```

2. **Install Dependencies**:
  ```bash
  npm install
```
1. **Set Up the Database**:
- Ensure you have MySQL or PostgreSQL installed and running.
- Create a database for your application:
    ```bash
    CREATE DATABASE your_database_name;
    ```
 - Run database migrations (if applicable):
  - For Sequelize:
    ```bash
    npx sequelize-cli db:migrate
    ```
1. **Configure Environment Variables**:
    - Create .env file
      
2. **Run the Application**:
   ```bash
   npm start
## Deploy instructions

1. Prepare the Server:
- Ensure your Ubuntu 24.04 LTS server is set up with necessary software (e.g., Docker, Nginx, etc.).

2. Clone the Repository on the Server:

    ```bash
    git https://github.com/VishalPrasanna11/webapp
    cd webapp
    ```
3. Install Dependencies (as mentioned above).
4. Set Up Database on the server (as mentioned above).
5. Run the Application in Production:
- Consider using a process manager like pm2 for Node.js or Gunicorn for Python applications.
- Alternatively, containerize your application using Docker.
6. Configure a Reverse Proxy (if using Nginx):
- Create an Nginx configuration file for your application and set it up to reverse proxy requests to your application.

## Conclusion
- This cloud-native web application is designed to be scalable, resilient, and suitable for deployment in a cloud environment. Follow the instructions above to set up, build, and deploy your application locally and on a cloud server.
