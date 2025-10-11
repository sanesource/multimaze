# Power-up Implementation: Time Freeze

## Overview
Successfully implemented Time Freeze power-up for single-player (non-team) games:
- **Time Freeze** - Freeze all opponents for 3 seconds (1 charge per game)

## Quick Summary
- **Activation**: F key for Time Freeze
- **Availability**: Only in single-player mode (not in team mode)
- **Charges**: 1 charge per player per game
- **Server Authority**: All validation and logic handled server-side
- **Visual Effect**: Animated falling snowflakes with freeze message

## Features Implemented

### Backend Changes

#### 1. Player Model (`backend/models/Player.js`)
**New Properties:**
- `timeFreezeCharges` (init: 1)
- `frozenUntil` (timestamp or null)

**New Methods:**
- `useTimeFreeze()` - Uses time freeze charge
- `freeze(duration)` - Freezes player for specified duration
- `unfreeze()` - Unfreezes player
- `isFrozen()` - Checks if player is currently frozen

**Updated Methods:**
- `reset()` - Resets power-up states
- `toJSON()` - Includes power-up states in serialization

#### 2. Game Handlers (`backend/sockets/gameHandlers.js`)

**New Socket Events:**
- `use-time-freeze` - Client requests time freeze activation

**New Handler Methods:**

**`onUseTimeFreeze()`** (lines 670-719):
- Validates game is active and player exists
- Checks team mode is disabled (power-ups only in single-player)
- Validates time freeze charges available
- Freezes all other players for 3 seconds
- Emits `time-freeze-activated` to activating player
- Emits `player-frozen` to each frozen player with freezer's username
- Emits `player-unfrozen` after 3 seconds

**Updated Movement Handler (`onPlayerMove`):**
- **Line 447-450**: Checks if player is frozen, blocks movement if true
- Frozen players cannot move at all during freeze duration

### Frontend Changes

#### 3. Socket Service (`frontend/src/services/socket.js`)
**New Methods:**
- `useTimeFreeze()` - Emits `use-time-freeze` event

#### 4. Game Context (`frontend/src/context/GameContext.jsx`)

**New State:**
- `timeFreezeCharges` (init: 1)
- `isFrozen` (boolean)
- `freezerUsername` (string) - Name of player who froze you

**New Socket Listeners:**
- `time-freeze-activated` → `handleTimeFreezeActivated`
- `player-frozen` → `handlePlayerFrozen`
- `player-unfrozen` → `handlePlayerUnfrozen`

**New Methods:**
- `useTimeFreeze()` - Calls socket service

**Event Handlers:**
- `handleTimeFreezeActivated()` - Updates charges
- `handlePlayerFrozen()` - Sets frozen state and stores freezer's username
- `handlePlayerUnfrozen()` - Clears frozen state and username

**Game Start Handler Update:**
- Resets power-up states when game starts (only in non-team mode)

#### 5. Game Component (`frontend/src/components/Game.jsx`)

**New Imports:**
- `Snowflake` icon from lucide-react (time freeze)

**New State:**
- `snowflakes` - Array of snowflake objects for animation

**Keyboard Controls (lines 110-119):**
- **F**: Activates time freeze (only in single-player mode)
- Power-up keys checked before movement keys to prevent conflicts

**UI Indicators (lines 986-997):**
Added power-up indicator in header (only shown when `!room?.settings?.teamMode`):
- **Time Freeze**: Snowflake icon, cyan color, shows charge count
  - Gray when depleted (0 charges)

**Visual Feedback:**

**Snowflake Animation (lines 105-138):**
- Creates 50 animated snowflakes when frozen
- Each snowflake has random:
  - Size (2-5px)
  - Starting position
  - Fall speed
  - Horizontal drift
- Snowflakes continuously fall and loop back to top
- Animation updates every 50ms

**Frozen State Overlay (lines 1025-1055):**
- **Falling snowflakes layer** (z-index 40):
  - 50 animated ❄ characters
  - White with 80% opacity
  - Realistic falling motion
- **Freeze message overlay** (z-index 50):
  - Semi-transparent black background (30%)
  - Glass-morphism card with:
    - Large "❄️ FROZEN ❄️" text (pulsing cyan)
    - Message: "{Player Name} has chosen to freeze you!"
- Blur effect on canvas
- Reduced canvas opacity (70%)

**Controls Display (lines 1044-1052):**
- Shows "Press F for Freeze ❄️"
- Only displayed in single-player mode

## Key Implementation Details

### Time Freeze Mechanics
1. Player activates with **F** key
2. All other players frozen for exactly 3 seconds
3. Frozen players cannot move (blocked in `onPlayerMove`)
4. Visual feedback: 
   - 50 animated falling snowflakes
   - Glass card overlay with freeze message
   - Shows who froze you
   - Canvas blur and reduced opacity
5. All frozen players unfrozen simultaneously after 3 seconds
6. Only 1 charge per game (no recharges)

### Team Mode Restriction
- Power-up only available when `room.settings.teamMode === false`
- Backend validates this before allowing activation
- Frontend hides UI indicator and key binding in team mode

### Server Authority
- All validation happens server-side
- Client cannot cheat by manipulating charges
- Movement blocking for frozen players enforced server-side
- Freezer's username sent to all frozen players

## Socket Events

### Client → Server
- `use-time-freeze` - Request time freeze activation

### Server → Client
- `time-freeze-activated` - Time freeze activated successfully
  - Payload: `{ timeFreezeCharges, duration }`
- `player-frozen` - You have been frozen by another player
  - Payload: `{ duration, freezerUsername }`
- `player-unfrozen` - You are no longer frozen (no payload)

## Files Modified

### Backend (2 files)
1. `/backend/models/Player.js` - Power-up properties and methods
2. `/backend/sockets/gameHandlers.js` - Power-up handlers and movement validation

### Frontend (3 files)
1. `/frontend/src/services/socket.js` - Socket methods for power-ups
2. `/frontend/src/context/GameContext.jsx` - State management and event handlers
3. `/frontend/src/components/Game.jsx` - UI, keyboard controls, visual feedback

## Testing Checklist

- [x] Backend Player model has power-up properties
- [x] Backend handlers validate team mode
- [x] Backend handlers validate charges
- [x] Time freeze freezes all opponents
- [x] Frozen players cannot move
- [x] Players unfreeze after 3 seconds
- [x] Freezer's username sent to frozen players
- [x] Frontend displays power-up indicator
- [x] Frontend keyboard control works (F key)
- [x] Frontend shows animated snowflakes when frozen
- [x] Frontend shows freeze message with player name
- [x] Power-up hidden in team mode
- [x] Power-up resets on game start
- [x] No linter errors
- [x] Arrow keys fixed (working properly)

## Usage Instructions

### For Players

**Time Freeze:**
1. Press `F` to activate
2. All opponents frozen for 3 seconds
3. Frozen players see:
   - 50 animated falling snowflakes
   - Message: "{Your Name} has chosen to freeze you!"
   - Cannot move during freeze
4. Move freely while others cannot
5. 1 charge per game (no recharges)

**Notes:**
- Only available in single-player (non-team) games
- Power-up shown in header with charge count (cyan snowflake icon)
- Charge count goes from 1 to 0 when used
- Icon grays out when depleted

## Known Limitations

1. Only 1 charge per game (no recharges)
2. Not available in team mode
3. In single-player rooms (only 1 player), time freeze has no effect
4. Snowflake animation performance depends on device capability

## Future Enhancements (Not Implemented)

- Multiple charges or recharge mechanics
- Team mode support with different mechanics
- More power-up types (speed boost, teleport, etc.)
- Power-up pickups in maze
- Cooldown system instead of single-use
- More elaborate freeze effects (ice crystals, particles)

## Implementation Notes

- F key used for time freeze (no conflicts with WASD movement)
- All timers use setTimeout (could be improved with proper timer management)
- Frozen state checked on every movement attempt
- Snowflake animation uses React state for smooth updates
- Visual feedback combines CSS effects and DOM manipulation
- Server-side validation prevents client-side cheating
- Freezer's username passed through socket events for personalized message


