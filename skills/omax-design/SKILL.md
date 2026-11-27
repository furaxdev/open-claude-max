---
name: omax-design
description: Méthode pour concevoir ou revoir une interface - direction artistique, hiérarchie, grille, typographie, palette, contrastes WCAG, états, responsive, thèmes (clair, sombre, pixel art, rétro 8-bit, néon, papier/carnet) et rendu vérifié par capture d'écran. À utiliser pour toute page, composant, thème ou maquette.
---

# Design

Complète `open-claude-max`.

## Méthode

1. **Direction artistique d'abord** : écris l'identité, le ton, le public et trois mots-clés avant le code. Ils guident chaque choix suivant.
2. **Hiérarchie** : un titre dominant et une action principale par écran.
3. **Grille et espacements** : une seule échelle (par exemple 4, 8, 12, 16, 24, 32 px). Un élément hors grille a une raison.
4. **Typographie** : deux polices au maximum, quatre à cinq tailles, interlignage de 1,4 à 1,6 pour le texte.
5. **Palette restreinte** : fond, surface, texte, accent, erreur. Chaque couleur a un rôle.
6. **Contrastes WCAG** : texte normal au moins 4,5:1, grand texte et composants d'interface au moins 3:1. Vérifie chaque paire, thème sombre compris.
7. **États** : survol, focus clavier visible, chargement, vide, erreur, désactivé.
8. **Responsive** : mobile (360 px), tablette (768 px), desktop (1280 px), sans débordement horizontal ni texte coupé.

## Thèmes

Thèmes au choix : clair, sombre, pixel art, rétro 8-bit, néon, papier/carnet. Couleurs, polices et espacements sont des variables de style : un thème est un jeu de valeurs, pas une réécriture.

```css
:root { --color-bg: #fafaf7; --color-text: #1d1d1b; --color-accent: #2f5d8c; }
[data-theme="dark"] { --color-bg: #121214; --color-text: #ececec; --color-accent: #8ab4f8; }
```

## À éviter

- dégradés partout, sans fonction ;
- cartes identiques en grille, sans hiérarchie ;
- icônes génériques qui n'apportent rien au sens ;
- textes marketing creux (« Révolutionnez votre expérience ») ;
- ombres sur chaque élément ;
- emojis utilisés comme icônes principales.

## Avant de livrer

Capture d'écran aux trois tailles, contrôle du focus clavier et des contrastes. Corrige ce qui déborde, se chevauche ou manque de contraste, puis recapture. Si aucune capture n'est possible, dis que le rendu n'est pas vérifié.
