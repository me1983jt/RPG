"""Install the Maine male recolor prototype into a local Fallout 2 CE game.
Usage: python scripts/install-maine-beta-critters.py PROTOTYPE.zip GAME_ROOT
Original game assets are not distributed in this repository.
"""
import argparse
import re
import shutil
import zipfile
from pathlib import Path
from datetime import datetime

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("game_root", type=Path)
    args = parser.parse_args()
    root = args.game_root.resolve()
    if not root.is_dir():
        parser.error("Game root must exist")
    dest = root / "data" / "art" / "critters"
    with zipfile.ZipFile(args.archive) as archive:
        entries = {}
        for item in archive.infolist():
            name = item.filename.lower()
            if re.fullmatch(r"data/art/critters/hmjmps[a-z]{2}\.fr[m0-5]", name):
                if name in entries:
                    parser.error("Duplicate animation: " + name)
                entries[name] = item
        if len(entries) != 196 or not all("data/art/critters/hmjmps" + action + ".frm" in entries for action in ("aa", "ab", "at")):
            parser.error("Expected complete 196-file male prototype")
        payload = {Path(name).name: archive.read(item) for name, item in entries.items()}
        if any(len(data) < 62 for data in payload.values()):
            parser.error("Invalid short FRM")
    dest.mkdir(parents=True, exist_ok=True)
    backup = root / ("maine-critter-backup-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f"))
    backup.mkdir()
    existing = {p.name.lower(): p for p in dest.iterdir() if p.is_file()}
    for name in payload:
        if name in existing:
            shutil.copy2(existing[name], backup / existing[name].name)
    for name, data in payload.items():
        target = existing.get(name, dest / name)
        target.write_bytes(data)
    print(f"Installed {len(payload)} beta animations. Existing overrides backed up to {backup}")

if __name__ == "__main__":
    main()
