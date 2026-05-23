# 🌿 Green Sahara - Gestion Circulaire : <link to="https://green-sahara-client.vercel.app/"></link>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" alt="MariaDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

## 📖 Présentation

**Green Sahara** est une plateforme web de gestion circulaire connectant les **générateurs de déchets (Providers)** et les **agriculteurs (Farmers)** pour valoriser les déchets organiques. Elle intègre l'IA Google Gemini pour l'analyse et l'aide à la décision.

Interface bilingue **Français/Arabe** avec support complet **RTL**.

---

## 🚀 Démarrage Rapide

```bash
npm install
npm run install:all
npm run dev
```

Accessible sur `http://localhost:5173`

---

## 📂 Structure du Projet

```text
green-sahara/
├── client/                  # Frontend (React + Vite + Tailwind)
│   └── src/
│       ├── components/      # Composants réutilisables
│       │   ├── admin/
│       │   ├── farmer/
│       │   └── landing/
│       ├── constants/       # Constantes centralisées
│       ├── hooks/           # Custom React hooks
│       ├── i18n/            # Traductions FR/AR
│       ├── layouts/         # Layouts (Sidebar, Topbar)
│       ├── pages/           # Pages (Farmer, Provider, Admin)
│       ├── routes/          # Routing
│       ├── services/        # Appels API
│       ├── store/           # État global (Zustand)
│       └── utils/           # Utilitaires
├── server/                  # Backend (Express + Prisma)
│   └── src/
│       ├── config/          # Configuration (DB, Passport, Env)
│       ├── controllers/     # Requêtes HTTP (légers)
│       ├── middlewares/     # Auth, Erreurs, Validation
│       ├── prisma/          # Schema + Migrations
│       ├── routes/          # Endpoints API
│       ├── services/        # Logique métier
│       ├── utils/           # Logger, ApiError, Token
│       └── validations/     # Schémas express-validator
├── .env.example             # Template de configuration
└── package.json             # Scripts (dev, build, migrate)
```

---

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React, Tailwind CSS, Vite, Zustand, i18next |
| Backend | Node.js, Express.js |
| Base de données | MariaDB + Prisma ORM |
| IA | Google Gemini (Chat + Vision) |
| Auth | JWT + Google OAuth 2.0 |

---

## 📝 Licence

MIT — Réalisé avec ❤️ pour un futur plus vert. 🌍
