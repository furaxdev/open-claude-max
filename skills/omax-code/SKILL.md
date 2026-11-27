---
name: omax-code
description: Méthode pour écrire, modifier, corriger, tester, refactorer, migrer ou déployer du code. À utiliser dès qu'une demande parle de code, bug, fonction, fichier, projet, commit, PR, revue de code, lint, tests, refactoring, migration de dépendances, scaffold, npm, pip, Git, Docker, Render, Vercel, Supabase ou variables d'environnement. Lecture ciblée des fichiers, plan court, petits blocs testés, code minimal, commits conventionnels, revue avant PR, aucun secret commité.
---

# Code

Complète `open-claude-max`. Les règles de lisibilité de ce skill s'appliquent à tout code écrit.

## Boucle de travail

1. **Lecture ciblée** : `grep` ou `glob` avant de charger un fichier entier. Lis seulement les sections utiles.
2. **Plan court** (3 à 6 lignes) avant toute grosse modification : fichiers touchés, approche, risques.
3. **Petits blocs** : écris un bloc, lance les tests, corrige, puis passe au suivant.
4. **Code minimal** : pas d'abstraction pour un seul cas, pas de dépendance si la bibliothèque standard suffit. Supprime le code mort et les imports inutilisés.

## Commit et PR

- Avant commit : lint, formatage du projet, tests verts.
- Messages conventionnels : `type(périmètre): résumé`, avec `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` ou `ci`. Un commit = une intention.
- Revue avant PR : relis le diff complet, vérifie l'absence de secrets et de fichiers parasites. Description : le pourquoi, les tests lancés, les points à relire.
- Ne crée une PR que si l'utilisateur la demande.

## Refactoring et migrations

- Refactoring : un changement à la fois, tests avant et après, aucun changement de comportement.
- Migration de dépendances : lis le guide de migration, mets à jour une dépendance par commit, relance tests, build et audit.

## Scaffold

Crée le minimum pour lancer le projet :

| Type | Minimum |
|---|---|
| Web | Une page, un script de dev |
| API | Point d'entrée, route de santé, fichier de config |
| Mobile | Projet généré par l'outil officiel du framework |
| CLI | Point d'entrée, `--help`, un test |
| Extension navigateur | `manifest.json`, un script de fond, une page d'options |

## Déploiement guidé

Avant de déployer : build et tests passent en local, les variables d'environnement sont listées dans `.env.example` sans valeurs, aucun secret n'est commité. Les secrets se saisissent dans la plateforme cible.

- **Render** : variables dans l'onglet Environment, commandes de build et de démarrage explicites.
- **Vercel** : variables par environnement (Preview, Production), redéploiement après chaque changement.
- **Supabase** : clé publique côté client, clé de service côté serveur uniquement.
- **Docker** : `.dockerignore` qui exclut `.env` et `node_modules`, image minimale, utilisateur non root.
