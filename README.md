
![homepage2_process](https://github.com/user-attachments/assets/5ba59e11-6822-42fe-b9af-4823c2f33962)

### A full-stack multiplayer web app containerized with Docker and served via Nginx, featuring a TypeScript frontend and a Fastify (Node.js) backend with OAuth and JWT-based authentication
> Built by students from 42 School to showcase real-time gameplay, secure web architecture, and modular deployment.

| ![about](https://github.com/user-attachments/assets/6bbaa945-9079-46dd-a34e-245347bb13e5) |  ![contact](https://github.com/user-attachments/assets/be4b3e73-2b8a-44f5-982a-50b40202dc30) |
|:--:|:--:|
|  ![profile](https://github.com/user-attachments/assets/374e7777-aaf0-49ff-ab98-6f103c55cb2f) | ![BrickWall](https://github.com/user-attachments/assets/afd6f91a-3151-4842-804a-c3db847515c2) |
| ![tournament](https://github.com/user-attachments/assets/5dc9def0-1fc9-475c-a0cb-e37c6110f563) |  ![aigame](https://github.com/user-attachments/assets/506af276-535b-4fce-8f69-7bb21f265437) |

<details>
  <summary><b>🎬 Click to watch the Full Demo Video</b></summary>
  
  [Watch the full demonstration of our application's features and gameplay](https://github.com/user-attachments/assets/25069b38-0d7d-47bb-bec5-01125281db57)
  
</details>

## How to Run It ⚙️

### Prerequisites
- [Docker](https://www.docker.com/get-started) installed and running

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/yvann-ba/ft_transcendence.git
cd ft_transcendence

# Create your .env file from example
cp .env.example .env
# Edit the .env file with your google auth values

# Start the application with Docker
make
# OR for Windows users
docker-compose -f ./docker-compose.yml up --build

# Access the application in your browser
https://localhost:8443
```

> **Note**: For Google OAuth to work, create your credentials at [Google Cloud Console](https://console.cloud.google.com/) and add them to your .env file.


## How It Works 🧠

<p align="center">
  <img src="https://github.com/user-attachments/assets/8b59e9cf-db7f-4fb4-a50d-4bd441b7a208" alt="Dockerized Architecture" width="738">
</p>

**🕹️ Game Experience:**
- Real-time WebSocket gameplay with smooth performance
- Customizable games (colors, rules, difficulty levels)
- Player dashboards with W/L stats and detailed match history

**🌍 User Experience:**
- Fully localized in English, French, and Spanish
- Google & local authentication (JWT-secured)
- GDPR compliance tools: data download, anonymization, deletion

**🔐 Security Layer:**
- JWT-protected routes & sessions
- HTTPS for all connections
- Robust validation on both frontend & backend
- XSS and SQL injection prevention
- Secrets & tokens stored securely in `.env`

All this in a responsive Single Page Application that works seamlessly across modern browsers

## 🙌 Check our Team

[//]: contributor-faces
<a href="https://github.com/yvann-ba"><img src="https://avatars.githubusercontent.com/u/97234242?v=4" title="Yvann" width="50" height="50"></a>
<a href="https://github.com/romainguign"><img src="https://avatars.githubusercontent.com/u/140240760?v=4" title="Romain" width="50" height="50"></a>
<a href="https://github.com/Lilien86"><img src="https://avatars.githubusercontent.com/u/125573483?v=4" title="Lilien" width="50" height="50"></a>
<a href="https://github.com/thomassolo"><img src="https://avatars.githubusercontent.com/u/116556004?v=4" title="Thomas" width="50" height="50"></a>
<a href="https://github.com/lukeslater0961"><img src="https://avatars.githubusercontent.com/u/45939824?v=4" title="Luke" width="50" height="50"></a>

[//]: contributor-faces

---

[![Featured on Awesome README](https://awesome.re/badge-flat.svg)](https://github.com/matiassingers/awesome-readme)

This project is featured on [Awesome README](https://github.com/matiassingers/awesome-readme) list, a curated collection of nice README files with over 19,000 stars.
