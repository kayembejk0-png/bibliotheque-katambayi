# Bibliothèque de la famille Katambayi

Site statique (index.html + books.json) avec une fonction d’administration (api/save.js).

## Mise en ligne
1. Créez un dépôt GitHub et envoyez-y tous ces fichiers.
2. Sur vercel.com : « Add New → Project », importez le dépôt, puis Deploy (aucun réglage de build).
3. Pour que l’administrateur publie depuis le site, ajoutez dans Vercel → Settings → Environment Variables :
   - `ADMIN_PASSWORD` : le mot de passe administrateur (choisissez-en un long)
   - `GITHUB_TOKEN` : jeton GitHub limité à ce dépôt (Fine-grained token, permission « Contents : Read and write »)
   - `GITHUB_REPO` : `votre-compte/nom-du-depot`
   - `GITHUB_BRANCH` : `main` (si différent)
   Puis redéployez.

## Utilisation
- Visiteurs : recherche et consultation seulement.
- Administrateur : lien « Administration » en bas de page, mot de passe, puis ajouter / modifier / supprimer, enfin « Publier ». Le site se met à jour en environ une minute.
- Sans les variables ci-dessus, le mode local exporte un fichier `books.json` à remplacer dans le dépôt.

## Photos
L’administrateur peut joindre une photo de couverture à chaque livre (formulaire d’ajout/modification). Les photos sont réduites automatiquement, enregistrées dans le dossier `photos/` du dépôt à la publication, et visibles par tous. En mode local, la photo est stockée dans `books.json` (fichier plus lourd).
