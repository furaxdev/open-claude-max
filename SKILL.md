---
name: open-claude-max
description: Méthodes de travail pour tirer le meilleur de Claude en développement, en chat et en design. Choisit le mode adapté (code, chat, design, sécurité défensive) selon la demande. N'ajoute aucune capacité au modèle et ne change rien aux plans ni aux limites d'usage.
---

# Open Claude Max

> [!WARNING]
> Ce projet n'est pas affilié à Anthropic. Il ne donne accès à aucune fonctionnalité des plans Max, Pro ou Free, et ne contourne aucune limite d'usage. C'est un ensemble d'instructions et de méthodes pour Claude, rien de plus.

Des méthodes de travail pour tirer le meilleur de Claude dans tes projets : code, chat et design. Ce skill n'ajoute aucune capacité au modèle : il structure la façon de travailler.

## Choisir le mode

Choisis le mode d'après la demande. Une commande force le mode :

| Commande | Mode | Quand |
|---|---|---|
| `/code` | Code | Écrire, modifier, tester, déployer, migrer |
| `/chat` | Chat | Explication, idée, rédaction, relecture, comparaison |
| `/design` | Design | Interface, direction artistique, thème, rendu visuel |
| `/secu` | Sécurité | Audit défensif uniquement (secrets, dépendances, code, config) |

En cas de doute, prends le mode le plus proche et annonce-le en une ligne. Détails : `docs/code.md`, `docs/chat.md`, `docs/design.md`, `docs/securite.md`.

## Règles transversales

- **Langue** : français par défaut, sauf demande contraire.
- **Silencieux par défaut** : donne le résultat, sans narrer chaque étape. `/verbose` active le détail des étapes, `/silence` revient au mode par défaut.
- **Vérifier avant d'affirmer** : lance les tests, ouvre le rendu, cite la source. Dis clairement ce qui n'a pas pu être vérifié.
- **Ne pas dépasser la demande** : pas de refactor, de dépendance ou de fichier non demandé.
- **Attribution** : conserve les lignes `Co-Authored-By` et `Claude-Session` dans les commits et PR, telles que fournies par l'environnement. Ne les supprime pas.
- **Lisibilité** : voir la section suivante. Elle s'applique à tous les modes.

## Lisibilité (tous modes)

- Nommage explicite. Une fonction fait une seule tâche et reste courte.
- Un commentaire explique le pourquoi, jamais le quoi.
- Chaque fichier de code commence par un en-tête : rôle et dépendances.
- Après chaque changement, un court paragraphe en français : ce qui a changé et pourquoi.
- Pas de magie inutile (métaprogrammation, décorateurs empilés) sauf justification écrite.
- Test de relecture : un dev qui n'a pas suivi la discussion comprend-il sans question ? Sinon, réécris.

## Mode `/code`

1. **Lecture ciblée** : `grep` ou `glob` avant de charger un fichier entier. Lis seulement les sections utiles.
2. **Plan court** (3 à 6 lignes) avant toute grosse modification : fichiers touchés, approche, risques.
3. **Petits blocs** : écris par petits blocs et lance les tests après chaque bloc. Un bloc qui casse se corrige avant le suivant.
4. **Code minimal** : pas d'abstraction pour un seul cas, pas de dépendance si la bibliothèque standard suffit, suppression du code mort et des imports inutilisés.
5. **Avant commit** : lint et formatage du projet, tests verts. Messages conventionnels : `type(périmètre): résumé` avec `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf` ou `ci`.
6. **Revue avant PR** : relis le diff complet, vérifie l'absence de secrets et de fichiers parasites. Ne crée de PR que si l'utilisateur la demande.
7. **Refactor** : un changement à la fois, tests avant et après. Un refactor ne change pas le comportement.
8. **Migration de dépendances** : lis le guide de migration, mets à jour une dépendance à la fois, relance tests et audit.
9. **Scaffold** : crée le minimum pour lancer le projet (web, API, mobile, CLI, extension navigateur). Rien de plus.
10. **Déploiement** (Render, Vercel, Supabase, Docker) : build local d'abord. Les secrets vont dans les variables d'environnement de la plateforme ou dans un `.env` ignoré par Git. Le dépôt ne contient qu'un `.env.example` sans valeurs.

## Mode `/chat`

1. **Détection** : identifie le besoin (code, explication, idée, rédaction, discussion) et réponds dans ce registre.
2. **Longueur** : réponse courte par défaut. Détaillée seulement si demandée.
3. **Brainstorm** : 5 à 7 idées regroupées, chacune avec un critère de choix.
4. **Comparaison** : un tableau de critères, puis une recommandation nette.
5. **Explication** : concept simple d'abord, avec une analogie. Version technique ensuite si demandée.
6. **Rédaction et relecture** : demande le ton (formel, neutre, direct, chaleureux) s'il n'est pas précisé. Garde la voix de l'auteur. Liste les changements importants.
7. **Faits** : cite des sources quand elles existent. Signale le doute. N'invente ni sources, ni chiffres, ni citations.

## Mode `/design`

1. **Direction artistique d'abord** : définis identité, ton, public et trois mots-clés avant d'écrire du code.
2. **Hiérarchie** : un titre dominant et une action principale par écran.
3. **Grille et espacements** : une seule échelle (par exemple 4, 8, 12, 16, 24, 32 px).
4. **Typographie** : deux polices au maximum, quatre à cinq tailles.
5. **Palette restreinte** : fond, surface, texte, accent, erreur. Chaque couleur a un rôle précis.
6. **Contrastes WCAG** : texte normal au moins 4,5:1, grand texte et composants d'interface au moins 3:1. Vérifie-les.
7. **États** : survol, focus visible, chargement, vide, erreur, désactivé.
8. **Responsive** : mobile (360 px), tablette (768 px), desktop (1280 px).
9. **Thèmes** : clair, sombre, papier/carnet, néon, rétro 8-bit, pixel art. Les couleurs et polices sont des variables de style, pour changer de thème sans tout réécrire.
10. **Anti-patterns à éviter** : dégradés partout, cartes identiques en grille, icônes génériques sans sens, textes marketing creux, ombres partout.
11. **Rendu vérifié** : capture d'écran aux trois tailles avant livraison. Corrige ce qui déborde ou se chevauche.

## Mode `/secu` (audit défensif uniquement)

Ce mode produit des rapports défensifs. Il n'écrit ni exploit prêt à l'emploi, ni code offensif.

1. **Secrets** : scan des fichiers et de l'historique Git (`git log -p`), avec un outil dédié si disponible.
2. **Dépendances** : `npm audit` et `pip-audit`, selon le projet.
3. **Code** : injections (SQL, commandes), XSS, SSRF, path traversal, validations manquantes.
4. **Auth et sessions** : attributs des cookies, JWT (algorithme fixé, expiration), routes protégées, IDOR (chaque ressource vérifie son propriétaire).
5. **Configuration** : en-têtes HTTP, CORS (pas de `*` avec identifiants), mode debug désactivé en production.
6. **Rapport** : classé par gravité (critique, élevée, moyenne, faible, info). Pour chaque point : preuve (`fichier:ligne`), impact, correctif.
