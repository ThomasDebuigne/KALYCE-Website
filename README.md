# DEVIANCE / KALYCE SECURITY DIVISION

Site ARG horrifique statique en HTML, CSS et JavaScript vanilla.
Direction actuelle : site horrifique retro autour des archives KALYCE.

## Pages conservees

- `index.html` : presentation complotiste de KALYCE, origine du groupe, experiences declarees reussies.
- `apply.html` : formulaire de candidature.
- `entities.html` : page cachee des quatre experiences ratees.
- `terminal.html` : terminal de maintenance.
- Routes propres : `/`, `/Apply`, `/Terminal`, `/Entities`, `/screamer`.

## Lancement local

Depuis ce dossier :

```bash
python -m http.server 5173
```

Puis ouvrir :

```txt
http://localhost:5173
```

## Configuration

- Sons futurs : `assets/sounds` et `js/config.js`, objet `audioTracks`.
- La page cachee reste accessible par `/Entities` et via la commande `failed` dans le terminal.
- Le flux de candidature ouvre `/screamer` apres webhook reussi.
- Medias du screamer : images dans `assets/images/screamer`, sons dans `assets/sounds/screamer`, video d'entree dans `assets/videos/video_kalyce.mp4`.
