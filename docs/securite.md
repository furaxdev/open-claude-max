# Mode sécurité (audit défensif)

Guide court du mode `/secu`. Résumé des règles dans `SKILL.md`.

## Périmètre

- Audit **défensif** : trouver les failles du projet pour les corriger.
- Pas d'exploit prêt à l'emploi, pas de payload, pas de code offensif.
- Pas de test contre un système qui ne t'appartient pas ou que tu n'es pas autorisé à tester.

## Ordre de l'audit

1. **Secrets** : fichiers du dépôt, puis historique Git.
2. **Dépendances** : versions vulnérables connues.
3. **Code** : injections, XSS, SSRF, path traversal, validations manquantes.
4. **Auth et sessions** : cookies, JWT, routes protégées, IDOR.
5. **Configuration** : en-têtes HTTP, CORS, mode debug.

## 1. Secrets

Commandes utiles :

```bash
# Recherche simple dans les fichiers suivis
git grep -nE "(api[_-]?key|secret|token|password)\s*[:=]"

# Recherche dans l'historique
git log -p | grep -nE "(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)"
```

Si un outil dédié est installé (`gitleaks`, `trufflehog`), préfère-le. Un secret trouvé dans l'historique est compromis : il faut le révoquer, pas seulement le supprimer du code.

## 2. Dépendances

```bash
npm audit --omit=dev
pip-audit
```

Pour chaque alerte : vérifie si la fonction vulnérable est réellement utilisée, puis propose la version corrigée.

## 3. Code

Points à vérifier :

- **Injections** : requêtes SQL construites par concaténation, commandes shell avec des entrées utilisateur.
- **XSS** : sorties HTML non échappées, `innerHTML` avec des données externes.
- **SSRF** : requêtes serveur vers une URL fournie par l'utilisateur, sans liste d'hôtes autorisés.
- **Path traversal** : chemins de fichiers construits à partir d'une entrée, sans normalisation.
- **Validation** : entrées non validées côté serveur.

## 4. Auth et sessions

- **Cookies** : `HttpOnly`, `Secure`, `SameSite` renseignés.
- **JWT** : algorithme fixé côté serveur, expiration courte, pas de secret faible.
- **Routes protégées** : chaque route sensible vérifie l'authentification.
- **IDOR** : chaque accès à une ressource vérifie qu'elle appartient à l'utilisateur courant.

## 5. Configuration

- **En-têtes HTTP** : `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`.
- **CORS** : jamais `*` avec des identifiants ; liste blanche d'origines.
- **Debug** : désactivé en production (`DEBUG=false`, pas de pages d'erreur détaillées).

## Format du rapport

Classe chaque point par gravité : **critique**, **élevée**, **moyenne**, **faible**, **info**.

```markdown
### [Élevée] Requête SQL construite par concaténation

- **Preuve** : `src/users.py:42`
- **Impact** : lecture de toute la table `users` par un utilisateur non connecté.
- **Correctif** : requête paramétrée.

    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

Termine par un résumé : nombre de points par gravité, et l'ordre de correction recommandé.
