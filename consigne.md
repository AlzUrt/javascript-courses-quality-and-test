Consignes :

À partir d'une base de code du Jeu du Pendu (lien), vous devez implémenter les fonctionnalités suivantes.
Chaque fonctionnalité doit être testée avec des tests unitaires en utilisant Jest.

Le taux de couverture de code minimum attendu est de 98 %. Une fonctionnalité non testée ne sera pas évaluée.

Certaines fonctionnalités, bien qu'elles ne puissent pas être entièrement testées de manière unitaire, seront tout de même évaluées.



Fonctionnalités à implémenter :

Même mot pour tout le monde, scores différents (3 points)

Le mot à deviner est le même pour tous les joueurs, mais chaque joueur aura un score unique.


Gestion du score (4 points)

5 essais au départ. Départ à 1000 points. Retrait de 1 point par seconde écoulée. Retrait de 50 points par essai raté.


Une seule partie par jour (2 points)

Chaque joueur ne peut jouer qu'une seule fois par jour.


Affichage des lettres choisies (2 points)

Toutes les occurrences d'une lettre choisie doivent s'afficher à chaque sélection.


Interface utilisateur soignée (2 points)

L'interface du jeu doit être agréable et visuellement attrayante.


Dynamisation des pages (3 points)

Affichage de la fin du jeu (victoire ou défaite). Affichage des scores.


Affichage des 1000 meilleurs scores avec pseudo (4 points)

Bonus de 1 point si les scores sont stockés avec SQLite.


Partage des scores (2 points)

Permettre aux joueurs de partager leurs scores.


Gestion des entrées utilisateurs  (1 points bonus)

Empêcher la saisie de caractères non valides, si la validation est bien gérée (lettres uniquement, case insensible, etc.).



Rendu du projet :

Vous devez forker le repo et me fournir le lien du fork, visible publiquement.
Le projet doit être testable immédiatement avec les commandes suivantes :

npm i pour installer les dépendances
npm run start pour lancer l'application
npm test pour exécuter les tests
