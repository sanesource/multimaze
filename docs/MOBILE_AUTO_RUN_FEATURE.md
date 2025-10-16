# Mobile Auto-Run Feature

## Overview

Added a "hold to move" auto-run feature for mobile devices to improve the touch control experience. Players can now hold down a direction button to continuously move instead of tapping repeatedly for each step.

## Problem Solved

**Original Issue**: Tapping a direction button for each single move step was tedious and provided poor UX on mobile devices. Players had to tap hundreds of times to navigate through a maze.

**Solution**: Implemented auto-run functionality where holding a direction button keeps the player moving continuously in that direction until released.

## How It Works

### User Experience

1. **Tap and Hold**: User touches and holds any direction button (↑, ↓, ←, →)
2. **Immediate Move**: Player moves one step immediately
3. **Continuous Movement**: Player continues moving in that direction every 150ms
4. **Release to Stop**: Player stops moving when the button is released
5. **Visual Feedback**: Button stays highlighted while held

### Technical Implementation

#### New State Management

```javascript
const moveIntervalRef = useRef(null); // Stores the interval timer
const moveDirectionRef = useRef(null); // Tracks current held direction
```

#### Start Movement Function

```javascript
const startMobileMove = (direction) => {
  // Clear any existing movement
  if (moveIntervalRef.current) {
    clearInterval(moveIntervalRef.current);
  }

  // Track direction and show visual feedback
  moveDirectionRef.current = direction;
  setActiveKeys((prev) => new Set(prev).add(direction));

  // Move immediately
  movePlayer(direction);

  // Set up continuous movement (150ms intervals)
  moveIntervalRef.current = setInterval(() => {
    if (moveDirectionRef.current === direction) {
      movePlayer(direction);
    }
  }, 150);
};
```

#### Stop Movement Function

```javascript
const stopMobileMove = (direction) => {
  // Clear the movement interval
  if (moveIntervalRef.current) {
    clearInterval(moveIntervalRef.current);
    moveIntervalRef.current = null;
  }

  // Clear direction tracking
  if (moveDirectionRef.current === direction) {
    moveDirectionRef.current = null;
  }

  // Remove visual feedback
  setActiveKeys((prev) => {
    const newSet = new Set(prev);
    newSet.delete(direction);
    return newSet;
  });
};
```

#### Touch Event Handlers

Each direction button now has three event handlers:

```javascript
<button
  onTouchStart={(e) => {
    e.preventDefault();
    startMobileMove("up");
  }}
  onTouchEnd={(e) => {
    e.preventDefault();
    stopMobileMove("up");
  }}
  onTouchCancel={(e) => {
    e.preventDefault();
    stopMobileMove("up");
  }}
  className={`p-4 rounded-lg glass-dark active:bg-blue-500/50 transition-all touch-none ${
    activeKeys.has("up") ? "bg-blue-500/50 scale-110 shadow-lg" : ""
  }`}
>
  <ArrowUp className="w-6 h-6" />
</button>
```

### Key Touch Events

- **`onTouchStart`**: Fired when finger touches the button → starts continuous movement
- **`onTouchEnd`**: Fired when finger lifts from the button → stops movement
- **`onTouchCancel`**: Fired when touch is interrupted (e.g., finger slides off) → stops movement

## Configuration

### Movement Speed

The auto-run speed is set to **150ms** between moves:

```javascript
moveIntervalRef.current = setInterval(() => {
  if (moveDirectionRef.current === direction) {
    movePlayer(direction);
  }
}, 150);
```

This timing was chosen to:

- Be fast enough for smooth gameplay
- Be slow enough to maintain control
- Match the visual animation speed
- Work well with server-side movement validation

### Why 150ms?

- **Too fast (<100ms)**: Hard to control, players overshoot targets
- **Too slow (>200ms)**: Feels sluggish, still requires many taps
- **150ms**: Sweet spot for responsive yet controllable movement

## Platform-Specific Behavior

### Mobile Only

This feature is **only active on mobile devices**:

- Detected via user agent or screen width < 768px
- Desktop users continue using keyboard controls
- Maintains separate control schemes for optimal UX on each platform

### Why Mobile Only?

- Keyboards already support "hold key to repeat" natively
- Touch interfaces don't have this built-in behavior
- Mobile users specifically requested this improvement
- Keeps desktop behavior unchanged and familiar

## Benefits

### For Players

✅ Much faster maze navigation  
✅ Less finger fatigue from repeated tapping  
✅ More intuitive control scheme  
✅ Better overall mobile gameplay experience  
✅ Visual feedback shows button is being held

### For Development

✅ Simple implementation using intervals  
✅ No backend changes required  
✅ Works with existing movement validation  
✅ Easy to adjust timing if needed  
✅ Proper cleanup prevents memory leaks

## Edge Cases Handled

### 1. Multiple Button Presses

- If user presses a new direction, previous interval is cleared
- Only one direction can be active at a time
- Prevents conflicting movement commands

### 2. Touch Cancellation

- `onTouchCancel` ensures movement stops if touch is interrupted
- Handles cases where finger slides off button
- Prevents "stuck" movement states

### 3. Component Unmount

```javascript
useEffect(() => {
  return () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
  };
}, []);
```

- Cleanup function clears interval on component unmount
- Prevents memory leaks
- Ensures no movement continues after leaving game screen

### 4. Hitting Walls

- Backend validates each move attempt
- If player hits a wall, they simply stop moving
- Auto-run continues trying to move (in case wall clears)
- Player can release and press new direction

## Performance Considerations

### Minimal Overhead

- Only one `setInterval` active at a time
- Cleared immediately when button is released
- No accumulation of timers or memory leaks

### Network Efficiency

- Each move is still sent to server individually
- Server validates each move (prevents cheating)
- 150ms between moves = ~6.7 moves/second maximum
- Well within acceptable network traffic limits

### Battery Impact

- Minimal battery impact from single interval
- Movement stops when button released
- No continuous processing when idle

## Testing Checklist

### Functionality

- [x] Hold button moves player continuously
- [x] Release button stops movement
- [x] Visual feedback shows button is held
- [x] Only one direction active at a time
- [x] Touch cancel properly stops movement
- [x] Works for all four directions
- [x] Lightning button still works independently

### Edge Cases

- [x] Switching directions mid-hold
- [x] Multiple rapid taps
- [x] Finger slides off button
- [x] Component unmounts during movement
- [x] Player hits wall while holding
- [x] Network lag doesn't break behavior

### Performance

- [x] No memory leaks
- [x] Smooth movement without stuttering
- [x] Responsive button feedback
- [x] Works on various mobile devices

## Future Improvements

### Potential Enhancements

1. **Adjustable Speed**: Allow players to configure auto-run speed
2. **Acceleration**: Start slow, speed up if held longer
3. **Haptic Feedback**: Vibrate on each move (if supported)
4. **Visual Trail**: Show path being traversed
5. **Smart Stop**: Auto-stop at intersections (optional)

### Configuration Option

Could add a settings toggle:

```javascript
// In game settings
autoRunSpeed: "slow" | "medium" | "fast";

// Speed mapping
const speeds = {
  slow: 200,
  medium: 150,
  fast: 100,
};
```

## Metrics to Monitor

### Usage Stats

- Average hold duration per direction
- Number of moves per game (before vs after)
- Player completion times (faster navigation?)
- User feedback on control responsiveness

### Technical Metrics

- Memory usage patterns
- Network request frequency
- Client performance impact
- Touch event handling latency

## Deployment Notes

- **No Database Changes**: Feature is entirely client-side
- **No API Changes**: Uses existing movement endpoints
- **No Backend Changes**: Server validation unchanged
- **Backward Compatible**: Doesn't affect desktop users
- **No Configuration Required**: Works out of the box

## User Feedback Integration

This feature was implemented in direct response to user feedback:

> "On mobile devices, clicking the arrow button for each step move is not a nice UX"

**Result**: Significantly improved mobile gameplay experience with hold-to-move functionality.

## Related Documentation

- See `MOBILE_RESPONSIVE_UPDATE.md` for full mobile feature overview
- See `Game.jsx` for complete implementation

## Date

October 16, 2025

## Author

Implemented as part of mobile UX improvements
