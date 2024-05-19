# ⚡ K8s Deployment Generator ⚡

![Docker](https://img.shields.io/badge/Docker-20.10-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-brightgreen) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-orange)

## 📜 Description

Generate Kubernetes Deployment Files from Docker Compose 🐳. This project allows you to upload a `docker-compose.yml` file and automatically convert it to Kubernetes deployment files. You can then visualize the file structure and download the generated files as a ZIP archive.

## 🌟 Features

- 📤 Upload Docker Compose files
- 📁 Visualize the generated Kubernetes deployment files
- 📄 View file contents with a built-in code editor
- 📋 Copy file contents to clipboard
- 📥 Download all generated files as a ZIP archive

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Hub Account](https://hub.docker.com/)

### Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/k8s-deployment-generator.git
    cd k8s-deployment-generator
    ```

2. **Build and run the Docker container**:
    ```sh
    docker build -t k8s-deployment-generator .
    docker run -p 3000:3000 k8s-deployment-generator
    ```

3. **Open your browser** and navigate to `http://localhost:3000`.

### Using Docker Compose (Optional)

If you prefer using Docker Compose, create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    restart: always
