---
name: omax-security
description: Audit de sécurité défensif d'un projet. À utiliser quand l'utilisateur demande un audit, une revue de sécurité, un scan de secrets, de clés d'API ou de tokens, une vérification de dépendances vulnérables (npm audit, pip-audit) ou une recherche de failles comme injection, XSS, SSRF, path traversal, IDOR, JWT, cookies, CORS ou mode debug en production. Produit un rapport classé par gravité avec preuve, impact et correctif. Ne produit jamais d'exploit ni de code offensif.
---

# Sécurité (audit défensif)

Complète `open-claude-max`. Le but est de trouver les failles du projet pour les corriger. Pas d'exploit prêt à l'emploi, pas de payload, pas de test contre un système que l'utilisateur n'est pas autorisé à tester.

## Ordre de l'audit

1. **Secrets** : fichiers suivis, puis historique Git (`git log -p`). Utilise `gitleaks` ou `trufflehog` s'ils sont installés. Un secret présent dans l'historique est compromis : il faut le révoquer, pas seulement le supprimer.
2. **Dépendances** : `npm audit --omit=dev`, `pip-audit`, selon le projet. Pour chaque alerte, vérifie que la fonction vulnérable est utilisée, puis propose la version corrigée.
3. **Code** :
   - injections : SQL ou commandes construites par concaténation avec une entrée utilisateur ;
   - XSS : sorties HTML non échappées, `innerHTML` avec des données externes ;
   - SSRF : requêtes serveur vers une URL fournie par l'utilisateur, sans liste d'hôtes autorisés ;
   - path traversal : chemins construits à partir d'une entrée, sans normalisation ;
   - validations manquantes côté serveur.
4. **Auth et sessions** :
   - cookies : `HttpOnly`, `Secure`, `SameSite` ;
   - JWT : algorithme fixé côté serveur, expiration courte ;
   - routes protégées : chaque route sensible vérifie l'authentification ;
   - IDOR : chaque accès à une ressource vérifie qu'elle appartient à l'utilisateur.
5. **Configuration** : en-têtes HTTP (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`), CORS sans `*` avec identifiants, mode debug désactivé en production.

## Rapport

Classe chaque point par gravité : critique, élevée, moyenne, faible, info. Pour chaque point : preuve, impact, correctif.

```markdown
### [Élevée] Requête SQL construite par concaténation

- **Preuve** : `src/users.py:42`
- **Impact** : un utilisateur non connecté peut lire toute la table `users`.
- **Correctif** : requête paramétrée, `cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`.
```

Termine par le nombre de points par gravité et l'ordre de correction recommandé. Précise ce qui n'a pas pu être vérifié.
