# Interaction Guidelines

Motion and cursor changes must always signal something real, never decoration alone.

## Interaction Tiers

1. **Read-only data cards** (humidity, pressure, UV, visibility, air quality, life index, sun arc, feels-like, wind, nowcast):
   - `cursor: default`
   - Static in appearance regardless of cursor position (no hover state or motion)
   - No click behavior

2. **Actionable controls** (unit toggle, search bar, add-city chips, delete/select actions, refresh/pull-to-refresh, View more/Collapse):
   - `cursor: pointer`
   - Immediate undelayed feedback

3. **Navigational/draggable** (hourly strip, city swipe pages):
   - `cursor: grab` at rest
   - `cursor: grabbing` during drag
   - Momentum-based motion

4. **Ambient/background** (sky layer, particles, sun/moon glow):
   - No custom cursor
   - Zero interactivity
   - Responds only to data
