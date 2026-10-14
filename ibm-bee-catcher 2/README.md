# IBM Bee Catcher

Event engagement game: catch the bee, learn about IBM, win swag.

## Run

```bash
npm install
npm start
```

| Page | URL |
|------|-----|
| Game (kiosk / tablet) | http://localhost:3030/ |
| Live leaderboard (big screen) | http://localhost:3030/leaderboard.html |
| Admin | http://localhost:3030/admin.html |

Default admin password: `ibmadmin2025`. Change it in Admin > Event Settings before the event.

To let attendees play on their own phones, share `http://<your-laptop-ip>:3030/` on the same network.

## Admin

- Players & Prizes: search, edit score or name, delete, mark prize claimed, export CSV, reset leaderboard
- Tiers & Prizes: rename tiers, set score thresholds, prizes, colours, add or remove tiers
- Event Settings: event name, tagline, starting time, admin password
- IBM Facts: edit the facts shown between levels (JSON)

Data is stored in `data/db.json`. Delete that file to reset everything to defaults (`backend/defaults.js`).

## Gameplay

- 10 levels, each with its own name, speed, bee count and twists (golden bees, decoys, zig-zag flight). Clear a level by catching enough bees; each level-up adds 6 seconds.
- Start with 60 seconds. Golden bees give triple points and +3 seconds.
- Points per catch = (20 + 10 x level) x streak multiplier (1x to 5x, +1x every 3 catches in a row).
- A miss costs 10 points and resets the streak. Tapping a decoy (dark bee, red ring) costs 100.
- Clearing all 10 levels pays 25 points per second left on the clock.
- Works with mouse, touch (tablet or phone) and pen.

Default tiers: Worker Bee 2,000 / Pollinator 5,000 / Hive Master 11,000 / Queen Bee 18,000 (roughly: clear level 3 / 5 / 8 / all 10). Tune them in Admin > Tiers after a few real rounds.

## Notes

- Bee and logo artwork are cut from the Eye-Bee-M image in `public/img/`. Replace `bee_body.png`, `bee_wing_l.png`, `bee_wing_r.png`, `bee.png` and `ibm-eye-bee-m.png` to change it.
- Scores are submitted from the browser, so they are only lightly sanity-checked. Fine for an event; remove odd entries in Admin.
