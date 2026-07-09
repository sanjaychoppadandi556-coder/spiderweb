PLACE YOUR MODEL HERE
======================

This game expects a file named exactly:

    spiderman.glb

to exist in this "models" folder, so the final path is:

    models/spiderman.glb

Where to get a model:
  - Sketchfab (search "Spider-Man rigged" and filter by downloadable/
    free license), Mixamo (for a generic rigged humanoid + animations),
    or your own Blender export.
  - Export/download as .glb (binary glTF) so it's a single file.
  - For best results, make sure the model includes animation clips
    named something like "Idle", "Walk", and "Run" (the game searches
    clip names loosely, so "idle_01" or "mixamo.com|Walking" etc. will
    still be detected).

If this file is missing or fails to load, the game will still run:
  - A simple red capsule "stand-in" character will be used instead.
  - The browser console will show a warning so you know to add the
    real model.

No other code changes are required once you drop the correct
spiderman.glb file into this folder - script.js already points to
"./models/spiderman.glb".
