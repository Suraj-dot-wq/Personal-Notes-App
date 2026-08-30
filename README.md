# Personal Notes App

A full-stack Personal Notes application built with **React** and **Django**, containerized using **Docker**, and deployed on **AWS EC2**.

The project also includes an automated **Jenkins CI/CD pipeline** with a Jenkins Controller-Agent architecture, GitHub Webhook triggers, Docker Hub image publishing, and automated deployment using Docker Compose.

---

## 🚀 Project Overview

This project demonstrates how a full-stack web application can be containerized and deployed using DevOps tools and practices.

### Application

- React frontend
- Django backend
- Python
- Node.js

### DevOps & Deployment

- Linux / Ubuntu
- Git & GitHub
- Docker
- Docker Compose
- Nginx
- Jenkins
- Jenkins Remoting
- AWS EC2
- Docker Hub
- GitHub Webhooks

---

## 🏗️ Architecture

```text
                         Developer
                             |
                             | git push
                             v
                        GitHub
                             |
                             | Webhook
                             v
                   Jenkins Controller
                      AWS EC2 Instance
                             |
                             | Jenkins Remoting
                             v
                    Jenkins Agent
                      AWS EC2 Instance
                             |
             +---------------+---------------+
             |               |               |
             v               v               v
        Git Checkout    Docker Build    Docker Deployment
                             |
                             v
                        Docker Hub
                             |
                             v
                      Docker Compose
                             |
                             v
                       Application
                             |
                             v
                           Nginx
                             |
                             v
                           Users
