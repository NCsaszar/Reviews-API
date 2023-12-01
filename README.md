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
