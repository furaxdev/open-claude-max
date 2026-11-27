# Mode design

Guide court du mode `/design`. Résumé des règles dans `SKILL.md`.

## Direction artistique d'abord

Avant le code, écris en quelques lignes :

- **Identité** : ce que le produit est, en une phrase.
- **Ton** : sobre, joueur, technique, chaleureux, rétro…
- **Public** : qui l'utilise, sur quel appareil, dans quel contexte.
- **Trois mots-clés** : ils guident chaque choix suivant.

## Hiérarchie et grille

- Un seul titre dominant par écran.
- Une action principale visible. Les autres sont secondaires.
- Une échelle d'espacement unique : 4, 8, 12, 16, 24, 32 px.
- Alignement sur une grille. Un élément hors grille doit avoir une raison.

## Typographie

- Deux polices au maximum : une pour les titres, une pour le texte.
- Quatre à cinq tailles, définies en variables.
- Interlignage de 1,4 à 1,6 pour le corps de texte.

## Palette

Une palette restreinte, chaque couleur avec un rôle :

| Rôle | Usage |
|---|---|
| Fond | Arrière-plan de page |
| Surface | Cartes, panneaux |
| Texte | Corps et titres |
| Accent | Action principale, liens |
| Erreur | Messages d'erreur, champs invalides |

### Contrastes WCAG

- Texte normal : au moins 4,5:1 contre son fond.
- Grand texte (18 px gras ou plus, ou 24 px) et composants d'interface : au moins 3:1.
- Vérifie chaque paire, y compris en thème sombre.

## États à soigner

- **Survol** et **focus** : le focus clavier doit être visible.
- **Chargement** : un indicateur ou un squelette, pas un écran blanc.
- **Vide** : explique quoi faire ensuite.
- **Erreur** : dis ce qui s'est passé et comment le corriger.
- **Désactivé** : visible mais clairement inactif.

## Responsive

| Taille | Largeur de référence |
|---|---|
| Mobile | 360 px |
| Tablette | 768 px |
| Desktop | 1280 px |

Contrôle qu'il n'y a ni débordement horizontal ni texte coupé.

## Thèmes et variables

Définis les couleurs, polices et espacements comme variables CSS sur `:root`. Un thème est un ensemble de valeurs :

```css
:root {
  --color-bg: #fafaf7;
  --color-text: #1d1d1b;
  --color-accent: #2f5d8c;
}

[data-theme="dark"] {
  --color-bg: #121214;
  --color-text: #ececec;
  --color-accent: #8ab4f8;
}
```

Thèmes possibles : clair, sombre, papier/carnet, néon, rétro 8-bit, pixel art.

## Anti-patterns « AI slop » à éviter

- Dégradés partout, sans fonction.
- Cartes identiques en grille, sans hiérarchie.
- Icônes génériques qui n'apportent rien au sens.
- Textes marketing creux : « Révolutionnez votre expérience ».
- Ombres portées sur chaque élément.
- Emojis utilisés comme icônes principales.

## Rendu vérifié

Avant de livrer :

1. Capture d'écran aux trois tailles (360, 768, 1280 px).
2. Contrôle du focus au clavier.
3. Contrôle des contrastes.
4. Corrige ce qui déborde, se chevauche ou manque de contraste, puis recapture.
