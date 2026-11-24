# Maine: The Frozen Wasteland — pre-APK integration checkpoint

**Not an APK-ready release.** This checkpoint adds native source changes and reproducible preparation to v0.20, but the whole engine has not compiled or run in this environment. The name v0.27-preAPK denotes the target milestone, not completion of stages 0.21–0.27. All 92 approved design decisions remain the target. The HTML v0.16 playtest is unchanged. The original farm start is deliberately retained.

## Run independently tested code

```
cmake -S . -B build-tests
cmake --build build-tests --parallel
ctest --test-dir build-tests --output-on-failure
```

Seven test suites on Linux include existing HTML and C++ parity, 72 runtime identity combinations, and the actual native callbacks with mock engine clock/map/file APIs. The mocks are not SDL or a substitute for real engine linking. Four changed native translation units passed syntax-only compilation with temporary SDL declarations; game.cc emits pre-existing warnings. See V27-TEST-RESULTS.txt.

## What changed in native source
- The live Maine hook now runs the regional subset of the v0.20 daily simulation on actual observed game-clock day boundaries. No double ticking on render and no copying simulated player cash, inventory, HP, XP or SPECIAL into the engine. Only York and Harmony are bound; other maps report unmapped. Regional population, snow, supplies, wildlife, faction stability and trade update internally, but native stores and travel restrictions are not yet changed by those numbers.
- F11 displays a diagnostic summary in the native message monitor (desktop keyboard, no mobile UI verification). Background and primary profession from the existing selector persist in the extension. Advanced professions, quests, and all other player actions are still offline prototype mechanics.
- Native SAVE.DAT appends a bounded, versioned MFW1 extension record with length and checksum, instead of an independent slot-number sidecar. Failure writing the trailer uses existing native rollback path. A missing trailer allows legacy base saves without extension; a damaged/unknown trailer or clock mismatch disables the extension and blocks subsequent writes in that session rather than overwriting it. The engine still loads the base portion. Reset and failed load hooks clear state. FNV checksum detects accidental corruption, not malicious tampering. Actual native save/load and backup rollback still need desktop verification. Do not deploy on existing valuable saves without backups. Old MAINE_SESSION sidecars and HTML JSON are NOT automatically imported.
- Added guarded starting-map error handling and consistent load slot cursor selection. Farm initialization stays unchanged; York startup is not ready until the original farm script's required initialization is verified and migrated.
- Canonical shared headers copied into engine/src/maine/shared for Android's self-contained engine CMake source root; verify copies stay identical when updating.

## Build desktop first (no APK)

Requires CMake, C++17 compiler, Python, Git, Node for tests, network access or pinned Git checkouts. On a network-enabled development computer:

```
python tools/prepare-native.py /path/to/deps --fetch --build
```

For already cached, clean Git checkouts of the pinned revisions omit --fetch. If a failed fetch leaves a partial checkout, remove only that partial dependency directory before retrying. This helper has been exercised only in missing-dependency mode here; actual fetch/build awaits network. Exact revisions: fpattern 8523173ec252c3b796fcdfca0fcc6329642fbbe3, SDL release-2.26.1, zlib v1.3.1. The GitHub DNS check failed here. Android SDK/NDK are not configured. Existing Gradle wrapper 7.3.3, AGP 7.2.1 and compileSdk 32 are retained pending real compatibility checks. No Gradle assembly or APK signing was run.

## Private data setup

User must supply their own original DAT files and original Maine-FO2-open-world-v3-york-fixed.zip separately. Do not redistribute the DATs. This package contains only source, prototype HTML, metadata and tests.

```
python tools/stage.py /path/to/owned-data /path/to/new-private-game --mod-zip /path/to/Maine-FO2-open-world-v3-york-fixed.zip
python tools/verify-data.py /path/to/new-private-game
python tools/launch.py /path/to/desktop/fallout2-ce /path/to/new-private-game
```

Private staging and read-only DAT2 directory validation passed on all five actual archives, totaling 31,109 entries. Hashes in content/private-data-checksums.json. This is not full decompression/render validation of each base asset. Original Maine mod patch metadata matched the prior audit. Do not use --experimental-york as release configuration.

## Required before APK assembly

1. Obtain dependencies and fully compile/link desktop engine with real SDL. Fix all integration build errors. Test actual startup and save/load across slots, corrupted extension handling, native rollback, clock jumps and legacy saves.
2. Migrate original farm initialization into York start without losing original story or global variables. Verify spawn, map scripts, visibility, actual intermediate map IDs, travel and Harmony arrival.
3. Bind v0.20 quest transitions, skill checks, professions, and rewards to actual native dialogues, inventory, XP and quest state with transactional checks. Test one-time rewards and all backgrounds/outcomes. Native-owned player stats/inventory/clock must stay authoritative.
4. Connect regional prices, trading, snow/travel, survival, faction changes, NPCs, property, vehicles, companions, organizations, research and infrastructure to actual engine actions. Do not treat simulated state as completed native mechanics.
5. Finish native graphical content: accurate world map, verified sprites and equipment, local maps, dialogue, touch controls, portrait/landscape layouts. Three action modes in HTML are noncombat timed/turn-based/automatic prototypes; real native mode support is still outstanding.
6. Run unmodified-input desktop full chapter playtests, performance, and save migration/compatibility. Validate Android toolchain and importer without assembling APK; only then build APK when requested. Final physical Android smoke test necessarily follows an APK build.

See GAME-DESIGN.md for full approved scope, V20-START.md for offline core limitations, and ROADMAP.md for broader plans. Existing native engine and legacy prototypes remain included for reference. Keep the previous checkpoint unchanged.
