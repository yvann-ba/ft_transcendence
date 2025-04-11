![about](https://github.com/user-attachments/assets/f698de43-c35a-4012-bd59-350a042dfc0c)# ft_transcendence — Multiplayer Pong Reinvented 🕹️

[![Dockerized](https://img.shields.io/badge/Dockerized-%E2%9C%94%EF%B8%8F-blue?logo=docker&style=flat-square)](https://www.docker.com/)
[![Made at 42](https://img.shields.io/badge/Made%20at-42%20School-black?style=flat-square)](https://42.fr)
[![Multilingual](https://img.shields.io/badge/Languages-EN%20%7C%20FR%20%7C%20ES-yellowgreen?style=flat-square)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> A full-stack multiplayer web app containerized with Docker and served via Nginx, featuring a TypeScript frontend and a Fastify (Node.js) backend with OAuth and JWT-based authentication. Built by 42 School students to showcase real-time gameplay, secure web architecture, and modular deployment.

---

## 🎥 Full Site Walkthrough

<p align="center">
  <video src="[put full walkthrough video here]" width="100%" controls autoplay loop muted></video>
</p>

A complete UI walkthrough of the platform — from home screen to game selection, user login, settings, and navigation.

---


| ![about](https://github.com/user-attachments/assets/6bbaa945-9079-46dd-a34e-245347bb13e5) |  ![contact](https://github.com/user-attachments/assets/be4b3e73-2b8a-44f5-982a-50b40202dc30) |
|:--:|:--:|
|  ![profile](https://github.com/user-attachments/assets/374e7777-aaf0-49ff-ab98-6f103c55cb2f) | ![BrickWall](https://github.com/user-attachments/assets/afd6f91a-3151-4842-804a-c3db847515c2) |
| ![tournament](https://github.com/user-attachments/assets/5dc9def0-1fc9-475c-a0cb-e37c6110f563) |  ![aigame](https://github.com/user-attachments/assets/506af276-535b-4fce-8f69-7bb21f265437) |


---

## How to Run It ⚙️

Yes, you can run it on **Linux, macOS, or Windows** — no setup headaches.

```bash
# Clone the repo
git clone https://github.com/your-org/ft_transcendence.git
cd ft_transcendence

# Run everything with Docker
make

# Access in your browser
https://localhost:8443
```

That’s it. One command. Zero config. Ready to play.

---

## How It Works 🧠

[put diagram here]  

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

All this in a responsive SPA that works across browsers and devices.

---

## About the Project 🧩

[put image here if needed]  

**ft_transcendence** is more than just Pong — it’s an experiment in full-stack architecture, real-time systems, UI/UX polish, and privacy-by-design. Everything from game mechanics to OAuth, from animations to Docker, was crafted by us.

---

## Meet the Team 👥

Each member of the squad brought their own power-ups:

| Name | Role | Highlights |
|------|------|-----------|
| **Yvann Barbot** | Game Dev | AI Opponent, Tournament Logic |
| **Romain Guignard** | Fullstack | Fastify Backend, GDPR, UX Polish |
| **Thomas Soloherison** | Backend Auth | JWT, Google OAuth, Stats Dashboards |
| **Lilien Auger** | Realtime Engineer | WebSocket Integration, Multi-language UI |
| **Luke Slater** | Frontend | UI/UX Design, Mobile Support, i18n Setup |

➡️ Learn more on our [Contact Page](/contact) and [About Page](/about).

---
