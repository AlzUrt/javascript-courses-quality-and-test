# 🎮 Jeu du Pendu - Daily Word Game

![Node.js Version][nodejs-shield]
[![GitHub Actions][github-actions-shield]][github-actions-url]
[![Jest Coverage][jest-coverage-shield]][jest-coverage-url]
[![MIT License][license-shield]][license-url]

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

## 🚀 Pour commencer

### Prérequis

- Node.js (version 18 ou supérieure)
- npm (installé avec Node.js)

### Installation

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

### 🧪 Tests

Le projet inclut des tests unitaires et des tests end-to-end.

```bash
# Exécuter les tests unitaires
npm run test:unit

# Exécuter les tests E2E (pour les test e2e, il faut lancer l'application)
npm run test:e2e

# Exécuter tous les tests
npm run test:all
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
└── tools.js         # Utilitaires
```

## 🎮 Règles du jeu

1. Un nouveau mot est disponible chaque jour
2. Vous avez 5 essais pour deviner le mot
3. Le score commence à 1000 points et diminue avec :
   - Le temps qui passe
   - Les mauvaises lettres (-50 points)
4. Une seule partie par jour est autorisée
5. Partagez votre score sur Twitter une fois la partie terminée !
6. Consultez le tableau des meilleurs scores pour voir les meilleurs joueurs

## 🚀 Déploiement

Le projet inclut un workflow GitHub Actions pour le déploiement automatique. Voir le fichier `.github/workflows/ci.yml` pour les détails.

## 📝 License

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📫 Contact

AlzUrt_ : [@AlzUrt_](https://x.com/AlzUrt_)

Lien du projet: [https://github.com/AlzUrt/javascript-courses-quality-and-test](https://github.com/AlzUrt/javascript-courses-quality-and-test)

[nodejs-shield]: https://img.shields.io/badge/node.js-v18.x-green
[github-actions-shield]: https://github.com/AlzUrt/javascript-courses-quality-and-test/actions/workflows/ci.yml/badge.svg
[github-actions-url]: https://github.com/AlzUrt/javascript-courses-quality-and-test/actions
[jest-coverage-shield]: https://img.shields.io/badge/Jest%20Coverage-100%25-brightgreen
[jest-coverage-url]: https://github.com/AlzUrt/javascript-courses-quality-and-test/actions
[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]: https://opensource.org/licenses/MIT
