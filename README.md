# Day After Dawn
*Dead Quiet*

A single-player isometric zombie survival game that runs in the browser, set in the fictional Harlow County, Kentucky, in July 1993. It's an independent, non-commercial fan project inspired by *Project Zomboid*. All of its code, art, names and text are original. It isn't affiliated with or endorsed by The Indie Stone, who own Project Zomboid.

Current version: **1.13.1** (16 Oct 2026). The full history is in [docs/CHANGELOG.md](docs/CHANGELOG.md).

## Play
Open `dist/day_after_dawn.html` in Chrome, Edge or Firefox. It's one self-contained file and needs no server. If GitHub Pages is switched on for this repository, the game also runs at the Pages address (`index.html` forwards to it).

**Controls:**

| Key | Action |
|---|---|
| WASD | Move |
| Shift | Run |
| C | Sneak |
| E | Interact |
| Q | Door, or car horn |
| F | Flashlight |
| I | Inventory |
| H | Condition |
| K | Skills |
| M | Map |
| B | Craft and build |
| V | Search mode |
| T | Fast-forward |
| X | Shout |
| L | Light switch |
| 1-5 | Hotbar |
| R | Reload |
| Space | Shove or stomp |
| Left click | Swing |
| Hold right click | Aim |
| Scroll | Zoom |
| N | Mute |
| Esc | Pause |

## Build
The game is written as 53 source files in `src/`, joined in a fixed order into `dist/day_after_dawn.html`. The order matters, because later files override earlier definitions.

```
bash build.sh
```
On Windows, run it in Git Bash (installed with Git). Node.js is optional; if it's installed, the build also checks the syntax. Commit the rebuilt `dist/` file along with your source changes.

## Test
The tests use Python and Playwright (a headless browser):
```
pip install playwright
python -m playwright install chromium
python tests/smoke.py
```

| Test | What it does |
|---|---|
| `tests/smoke.py` | Starts a game, fails on any error. Runs automatically on GitHub after every push |
| `tests/stress.py` | Three simulated games played through |
| `tests/bug_survey.py` | World integrity checks: empty rooms, blocked doors, sealed buildings, stray walls, stuck zombies, broken loot and recipe data |
| `tests/trait_survey.py` | Measures every trait against a character without it |
| `tests/perf_survey.py` | Frame times across six scenarios |
| `tests/profile.py` | CPU profile of a scenario: `python tests/profile.py run`, or drive, zoom, chase or late |
| `tests/daylight_shots.py` | A contact sheet of screenshots across the day |

Screenshots and other output go to `tests/out/`, which isn't committed.

## Layout
```
src/            source: head.html (page, CSS, panels) + js1_data.js ... js53_perf.js
dist/           the built game (committed, so it can be played straight from GitHub)
docs/           CHANGELOG, RESEARCH, RECREATION_DOCUMENT (design), FUTURE_PLANS
tests/          Playwright test and survey scripts
tools/          setup_repo.sh (first commit), import_old_releases.sh (archive old builds)
.github/        automatic build check and smoke test on every push
```

## Versions
Big patches are 1.x (for example 1.12, a lighting pass). Small patches are 1.x.x (for example 1.9.3). Each release gets a changelog entry in `docs/CHANGELOG.md` and a Git tag (`v1.13`). Builds from before the move to Git can be imported onto the `release-history` branch with `tools/import_old_releases.sh`.

## Licence
None chosen yet, so all rights are reserved by default: you're welcome to read the code and play the game, but please don't redistribute it.
