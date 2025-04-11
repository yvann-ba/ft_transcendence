
![homepage2_process](https://github.com/user-attachments/assets/5ba59e11-6822-42fe-b9af-4823c2f33962)

### A full-stack multiplayer web app containerized with Docker and served via Nginx, featuring a TypeScript frontend and a Fastify (Node.js) backend with OAuth and JWT-based authentication.

#### Built by 42 School students to showcase real-time gameplay, secure web architecture, and modular deployment.




| ![about](https://github.com/user-attachments/assets/6bbaa945-9079-46dd-a34e-245347bb13e5) |  ![contact](https://github.com/user-attachments/assets/be4b3e73-2b8a-44f5-982a-50b40202dc30) |
|:--:|:--:|
|  ![profile](https://github.com/user-attachments/assets/374e7777-aaf0-49ff-ab98-6f103c55cb2f) | ![BrickWall](https://github.com/user-attachments/assets/afd6f91a-3151-4842-804a-c3db847515c2) |
| ![tournament](https://github.com/user-attachments/assets/5dc9def0-1fc9-475c-a0cb-e37c6110f563) |  ![aigame](https://github.com/user-attachments/assets/506af276-535b-4fce-8f69-7bb21f265437) |


---

## How to Run It ⚙️

Yes, you can run it on **Linux, macOS, or Windows** — no setup headaches.

```bash
# Clone the repo
git clone https://github.com/yvann-ba/ft_transcendence.git
cd ft_transcendence

# Run everything with Docker
make
(or docker-compose -f ./docker-compose.yml up --build for windows users)

# Access in your browser
https://localhost:8443
```

That’s it. One command. Zero config. Ready to play.

---

### How It Works 🧠

![Dockerized-Diagram](https://github.com/user-attachments/assets/eae2720e-5b85-475e-99fe-8c09e1b281b3)


Under the hood:
- **Frontend**: TypeScript, TailwindCSS, i18n
- **Backend**: Fastify (Node.js), Google OAuth, JWT
- **Database**: SQLite for persistence
- **Dockerized** with Nginx and HTTPS for clean deploys

Security and privacy are deeply integrated:
- JWT-protected routes & sessions
- HTTPS for all connections
- Robust validation on both frontend & backend
- XSS and SQL injection prevention
- Secrets & tokens stored securely in `.env` (and ignored by Git)

> In short: fast, portable, safe.

---

## Core Features ✨

- 🕹️ Real-time WebSocket gameplay  
- 🔐 Google & local auth (JWT-secured)  
- 🎨 Customizable games (colors, rules, difficulty)  
- 🌍 Fully localized in English, French, and Spanish  
- 📊 Player dashboards: W/L stats, match history  
- 🧑‍💼 GDPR tools: data download, anonymization, deletion  

All this in a responsive SPA that works across browsers.

---

## Team

[//]: contributor-faces
<a href="https://github.com/yvann-ba"><img src="https://avatars.githubusercontent.com/u/97234242?v=4" title="Yvann" width="50" height="50"></a>
<a href="https://github.com/romainguign"><img src="https://avatars.githubusercontent.com/u/140240760?v=4" title="Romain" width="50" height="50"></a>
<a href="https://github.com/Lilien86"><img src="https://avatars.githubusercontent.com/u/125573483?v=4" title="Lilien" width="50" height="50"></a>
<a href="https://github.com/thomassolo"><img src="https://avatars.githubusercontent.com/u/116556004?v=4" title="Thomas" width="50" height="50"></a>
<a href="https://github.com/lukeslater0961"><img src="https://avatars.githubusercontent.com/u/45939824?v=4" title="Luke" width="50" height="50"></a>

[//]: contributor-faces
