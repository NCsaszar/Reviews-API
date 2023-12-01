![NGINX](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![Loader.io](https://img.shields.io/badge/loader.io-%232C3A42.svg?style=for-the-badge)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Artillery](https://img.shields.io/badge/artillery-%23121011.svg?style=for-the-badge)
![SQL](https://img.shields.io/badge/SQL-%2300f.svg?style=for-the-badge&logo=sql&logoColor=white)
![Nodemon](https://img.shields.io/badge/nodemon-%2376D04B.svg?style=for-the-badge&logo=nodemon&logoColor=white)
![Jest](https://img.shields.io/badge/jest-%23C21325.svg?style=for-the-badge&logo=jest&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

# Product Pipeline - Reviews API

## Description
Product Pipeline is a high-performance, scalable API designed for handling extensive product reviews. Developed to efficiently process and serve over 10 million records, this API is optimized for rapid query response and robust data handling.

## Features
- **High-Performance Backend**: Custom ETL process for over 10 million records with PostgreSQL, ensuring efficient data management.
- **Optimized Query Performance**: Achieved significant query speed improvements with optimized database indexing and JOIN operations.
- **Scalability and Reliability**: Configured for high-load scenarios, capable of handling over 3000 RPS with zero-error performance.

## Technologies Used
- Database: PostgreSQL
- Backend: Express, NodeJS
- Deployment: AWS EC2, NGINX for load balancing

## Installation
Instructions for setting up the project locally.

```bash
git clone https://github.com/NCsaszar/Reviews-API-ProductPipeline.git
cd Reviews-API-ProductPipeline
start:db
start:server
