
# ⚡ K8s Deployment Generator ⚡

![Docker](https://img.shields.io/badge/Docker-20.10-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-brightgreen)

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

1. **Launch the Docker container**:

```sh
docker run -d -p 3000:3000 alxfrst/k8s-deployment-generator
```

3. **Open your browser** and navigate to `http://localhost:3000`.

### Using Docker Compose (Optional)

If you prefer using Docker Compose, create a `docker-compose.yml` file with the following content:

```yaml
services:
  app:
    image: alxfrst/k8s-deployment-generator
    ports:
      - "3000:3000"
    restart: always
```

Then, run:
```sh
docker-compose up -d
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any improvements.

## 📞 Contact

If you have any questions or feedback, feel free to reach out.

- [Alexandre Forestier](mailto:alexandreforestier1107@gmail.com)
- [GitHub](https://github.com/AlxFrst)

---

Happy coding! 🎉
