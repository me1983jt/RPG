Armor overlay art, picked up by file name (no code change needed):

  <item id>.png           drawn over the in-world hero. Same layout as hero.png: 4 walk frames across
                          x 8 facing rows down (S, SW, W, NW, N, NE, E, SE), same cell size, transparent.
  <item id>-portrait.png  drawn over the hero figure on the Pack screen (front view, same size/aspect as
                          one hero.png cell).

Item ids are in src/game/gear.ts (e.g. plate, rig, ironhat, felt, boots, packframe).
index.json lists the files; build-apk.sh rewrites it on every build. When testing in dev, add the
name to index.json by hand (or run the same one-liner from build-apk.sh).
