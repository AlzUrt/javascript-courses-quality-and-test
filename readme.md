# 🎮 Jeu du Pendu - Daily Word Game

![Node.js Version][nodejs-shield]
[![GitHub Actions][github-actions-shield]][github-actions-url]
[![Jest Coverage][jest-coverage-shield]][jest-coverage-url]
[![MIT License][license-shield]][license-url]
[![ESLint][eslint-shield]][eslint-url]
[![Docker][docker-shield]][docker-url]

## 🎯 À propos du projet

Un jeu du pendu moderne et interactif, inspiré par Cementix et Tusmo. Chaque jour, les joueurs doivent deviner un nouveau mot, avec un système de score basé sur le temps et la précision.

### ✨ Caractéristiques principales

- 🎲 Un nouveau mot à deviner chaque jour
- ⏱️ Système de score dynamique basé sur le temps
- 📊 Tableau des meilleurs scores
- 🔄 Limite d'une partie par jour
- 🐦 Partage des scores sur Twitter
- 💾 Sauvegarde des scores dans une base de données SQLite

### 🛠️ Construit avec

- [Node.js](https://nodejs.org/) - Environnement d'exécution
- [Express](https://expressjs.com/) - Framework web
- [SQLite](https://www.sqlite.org/) - Base de données
- [EJS](https://ejs.co/) - Moteur de template
- [Jest](https://jestjs.io/) - Tests unitaires
- [Playwright](https://playwright.dev/) - Tests E2E
- [Docker](https://www.docker.com/) - Conteneurisation de l'application
- [ESLint](https://eslint.org/) - Linting et qualité du code

## 🚀 Pour commencer

### Prérequis

- Node.js (version 18 ou supérieure)
- npm (installé avec Node.js)
- Docker (optionnel, pour l'utilisation avec conteneurs)

### Installation

#### 🔧 Installation classique

1. Clonez le repository

```bash
git clone https://github.com/AlzUrt/javascript-courses-quality-and-test
```

2. Installez les dépendances

```bash
npm install
```

3. Lancez l'application

```bash
npm start
```

L'application sera disponible sur http://localhost:3030

#### 🐳 Installation avec Docker

1. Construisez l'image Docker

```bash
docker build -t hangman-game .
```

2. Lancez le conteneur

```bash
docker run -p 3030:3030 hangman-game
```

L'application sera disponible sur http://localhost:3030

### 🧪 Tests et Qualité du Code

Le projet inclut des tests unitaires, des tests end-to-end et des outils de qualité de code.

```bash
# Exécuter les tests unitaires
npm run test:unit

# Exécuter les tests E2E (pour les test e2e, il faut lancer l'application)
npm run test:e2e

# Exécuter tous les tests
npm run test:all

# Lancer ESLint
npm run lint

# Corriger automatiquement les erreurs ESLint
npm run lint:fix
```

## 📊 Structure du projet

```
hangman-game/
├── test/
│   ├── jest/        # Tests unitaires
│   └── playwright/  # Tests E2E
├── views/
│   ├── pages/       # Templates EJS
│   └── partials/    # Composants EJS réutilisables
├── db.js            # Gestion de la base de données
├── game.js          # Logique du jeu
├── index.js         # Point d'entrée de l'application
├── tools.js         # Utilitaires
├── Dockerfile       # Configuration Docker
├── .dockerignore    # Fichiers ignorés par Docker
├── eslint.config.mjs # Configuration ESLint
└── .github/
    └── workflows/   # Configuration CI/CD
```

[Le reste du README reste identique jusqu'aux badges]

[nodejs-shield]: https://img.shields.io/badge/node.js-v18.x-green
[github-actions-shield]: https://github.com/AlzUrt/javascript-courses-quality-and-test/actions/workflows/ci.yml/badge.svg
[github-actions-url]: https://github.com/AlzUrt/javascript-courses-quality-and-test/actions
[jest-coverage-shield]: https://img.shields.io/badge/Jest%20Coverage-100%25-brightgreen
[jest-coverage-url]: https://github.com/AlzUrt/javascript-courses-quality-and-test/actions
[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]: https://opensource.org/licenses/MIT
[eslint-shield]: https://img.shields.io/badge/ESLint-enabled-4B32C3.svg
[eslint-url]: https://eslint.org/
[docker-shield]: https://img.shields.io/badge/Docker-enabled-2496ED.svg?logo=docker
[docker-url]: https://www.docker.com/
