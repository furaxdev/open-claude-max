# Mode code

Guide court du mode `/code`. Résumé des règles dans `SKILL.md`.

## Quand l'utiliser

Écrire, modifier, tester, refactorer, migrer, scaffolder ou déployer un projet.

## Boucle de travail

1. Repère les fichiers concernés : `grep -rn "nomDeFonction" src/`, `glob "**/*.test.*"`.
2. Lis les sections utiles seulement, pas le fichier entier.
3. Annonce le plan en 3 à 6 lignes si le changement est gros.
4. Écris un bloc, lance les tests, corrige, puis passe au bloc suivant.
5. Lance le lint et le formatage avant le commit.
6. Relis le diff. Ajoute un paragraphe : ce qui a changé et pourquoi.

## Commits et PR

- Commits conventionnels : `feat(auth): ajoute la vérification de session`.
- Un commit = une intention. Un refactor et une correction ne se mélangent pas.
- PR : une description qui explique le pourquoi, la liste des tests lancés, les points à relire.
- Ne crée une PR que sur demande explicite.

## Migration de dépendances

1. Lis le guide de migration officiel et les notes de version.
2. Mets à jour une seule dépendance par commit.
3. Relance tests, build et audit (`npm audit`, `pip-audit`).
4. Note dans le message de commit ce qui a changé côté API.

## Scaffold

Crée le minimum pour lancer le projet :

| Type | Minimum |
|---|---|
| Web | Entrée HTML ou framework, une page, un script de dev |
| API | Un point d'entrée, une route de santé, un fichier de config |
| Mobile | Projet généré par l'outil officiel du framework |
| CLI | Point d'entrée, `--help`, un test |
| Extension navigateur | `manifest.json`, un script de fond, une page d'options |

## Déploiement

Avant de déployer :

- Build et tests passent en local.
- Les variables d'environnement sont listées dans `.env.example`, sans valeurs.
- Les secrets sont saisis dans la plateforme cible, jamais dans le dépôt.

Cibles courantes :

- **Render** : variables dans l'onglet Environment, commande de build et de démarrage explicites.
- **Vercel** : variables par environnement (Preview, Production), redéploiement après chaque changement.
- **Supabase** : clés publiques côté client seulement, clé de service côté serveur uniquement.
- **Docker** : `.dockerignore` pour exclure `.env` et `node_modules`, image minimale, utilisateur non root.

## Erreurs fréquentes à éviter

- Ajouter une abstraction "au cas où". Attends le deuxième usage.
- Installer une dépendance pour une fonction de quelques lignes.
- Laisser du code commenté ou des imports inutilisés.
- Committer un `.env` ou une clé d'API, même pour un test rapide.
