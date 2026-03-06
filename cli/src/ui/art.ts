/**
 * Aegis ASCII Art
 *
 * All visual assets live here. Pure data — no rendering logic.
 * Minimal, iconic, playful. Designed for 80-column terminals.
 *
 * These are not decoration. They give Aegis a physical presence
 * in the terminal — a character who walks into the room, thinks
 * visibly, and has a personality you can see.
 */

// ── Colors ─────────────────────────────────────────────────────────────

// We export raw strings. The terminal layer handles colorization.
// This keeps art.ts purely about shapes.

// ── Intro Logo ─────────────────────────────────────────────────────────

/**
 * Block letter AEGIS wordmark with tagline.
 * Clean, bold, unmistakable. ~8 lines tall, fits 80-column terminals.
 */
export const AEGIS_LOGO: string = [
  "",
  "     \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557",
  "    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D",
  "    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551  \u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557",
  "    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551",
  "    \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551",
  "    \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D",
  "    \u2500\u2500 governance for ai agents \u2500\u2500",
  "",
].join("\n");

/** Height of the intro logo in lines (for cursor math) */
export const AEGIS_LOGO_HEIGHT = AEGIS_LOGO.split("\n").length;

// ── Thinking Animations ────────────────────────────────────────────────

/**
 * Zeus throwing a lightning bolt.
 * Loops until Aegis is ready. The bolt goes out and comes back.
 * Each frame is the same height for clean redrawing.
 */
export const ZEUS_LIGHTNING_FRAMES: string[] = [
  // Frame 1 — winding up
  `
      \\O    
       |\\   
      / \\  \u26A1
             
             
`,
  // Frame 2 — throwing
  `
      \\O/   
       |  \u2500\u2500\u26A1
      / \\     
              
              
`,
  // Frame 3 — bolt in flight
  `
      \\O    
       |\\        \u26A1
      / \\          
                   
                   
`,
  // Frame 4 — bolt far out
  `
      \\O    
       |\\             \u26A1
      / \\               
                        
                        
`,
  // Frame 5 — bolt returning
  `
      \\O    
       |\\        \u26A1
      / \\          
                   
                   
`,
  // Frame 6 — caught
  `
     \u26A1O    
       |\\   
      / \\  
            
            
`,
];

/**
 * Einstein walking across the terminal, glancing at the user.
 * Each frame shifts his position. Same height for clean redraw.
 * Plays left to right, then the sequence reverses.
 */
export const EINSTEIN_WALK_FRAMES: string[] = [
  // Frame 1
  `
  ~o/        
   /|        
   / \\    \uD83E\uDD14 
             
`,
  // Frame 2
  `
     ~o/     
      /|     
      / \\  \uD83E\uDD14
             
`,
  // Frame 3
  `
        ~o/  
         /|  
        / \\ \uD83E\uDD14
             
`,
  // Frame 4 — glances at user
  `
        \\o~  
         |\\  
        / \\ \uD83D\uDC40
             
`,
  // Frame 5
  `
           \\o~
            |\\ 
           / \\
              
`,
  // Frame 6
  `
              \\o~
               |\\ 
              / \\
                 
`,
];

// ── Utilities ──────────────────────────────────────────────────────────

/** Consistent frame height for thinking animations (for cursor math) */
export const THINKING_FRAME_HEIGHT = 6;

/** All thinking animations, for random selection */
export const THINKING_ANIMATIONS = [
  ZEUS_LIGHTNING_FRAMES,
  EINSTEIN_WALK_FRAMES,
];