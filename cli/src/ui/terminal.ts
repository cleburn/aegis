/**
 * Terminal UI
 *
 * This is NOT an app interface. It's a conversation with personality.
 *
 * Aegis is a person in another room. Messages arrive like texts from
 * a colleague. When Aegis needs a moment to think, he's visibly present —
 * a playful animation fills the pause the way a person might drum their
 * fingers or pace while working something out.
 *
 * Visual elements are NEVER chrome or decoration. They're part of Aegis's
 * character — the logo is him walking into the room, the animations are
 * him thinking out loud.
 *
 * The spirit check: Does this feel like working with someone who has
 * presence and personality? If anything feels like "interacting with
 * software," we've drifted.
 */

import * as readline from "node:readline";
import chalk from "chalk";
import {
  AEGIS_LOGO,
  SHIELD_PULSE_FRAMES,
  THINKING_ANIMATIONS,
  THINKING_FRAME_HEIGHT,
} from "./art.js";

// ── Color Palette ──────────────────────────────────────────────────────
// Not branded, just warm. Two distinct voices in the conversation.

const AEGIS_COLOR = chalk.hex("#5B8DEF");
const YOU_COLOR = chalk.hex("#A8D8A8");
const DIM = chalk.dim;
const ACCENT = chalk.hex("#5B8DEF");
const CHECK = chalk.hex("#A8D8A8");
const PROGRESS = chalk.hex("#FFD700");

// ── Conversation Chrome ────────────────────────────────────────────────
// Visual anchors that make speaker turns scannable at a glance.
// The bar character (▎) runs down the left edge of each turn,
// giving the conversation a spatial rhythm you can see when scrolling.

const AEGIS_BAR = AEGIS_COLOR("▎");
const YOU_BAR = YOU_COLOR("▎");
const AEGIS_LABEL = AEGIS_COLOR("aegis");
const YOU_LABEL = YOU_COLOR("you");

/** Minimum terminal width needed for the wide shield assembly animation */
const MIN_WIDTH_FOR_ASSEMBLY = 54;

export class TerminalUI {
  private rl: readline.Interface | null = null;
  private isStreaming = false;
  private thinkingTimer: ReturnType<typeof setTimeout> | null = null;
  private thinkingInterval: ReturnType<typeof setInterval> | null = null;
  private isAnimating = false;
  private currentFrameIndex = 0;
  private currentAnimation: string[] | null = null;
  private linesDrawn = 0; // actual visual lines on screen for current animation

  // ── Intro Sequence ─────────────────────────────────────────────────

  /**
   * Show the Aegis logo. Clean, confident entrance.
   */
  async playIntro(): Promise<void> {
    // Clear terminal for a clean entrance
    process.stdout.write("\x1b[2J\x1b[H");

    // Show the logo with color
    const coloredLogo = colorizeLogo(AEGIS_LOGO);
    process.stdout.write(coloredLogo);
    await sleep(1500);

    // Clear to clean slate, ready for conversation
    clearScreen();
    console.log("");
  }

  /**
   * Quiet entrance for return visits. No logo, no fanfare.
   */
  showWelcome(): void {
    console.log("");
    console.log(DIM("  aegis init\n"));
  }

  // ── Conversation ───────────────────────────────────────────────────

  /**
   * Show an Aegis message — complete, not streamed.
   * Blue bar + label, full-brightness text, word-wrapped to terminal width.
   */
  showAegisMessage(message: string): void {
    const prefix = `  ${AEGIS_BAR} ${AEGIS_LABEL}  `;
    const continuation = `  ${AEGIS_BAR}         `;
    const wrapped = wrapText(message, getWrapWidth());
    const lines = wrapped.split("\n");

    console.log(prefix + lines[0]);
    for (let i = 1; i < lines.length; i++) {
      console.log(continuation + lines[i]);
    }
    console.log(`  ${AEGIS_BAR}`);
    console.log("");
  }

  /**
   * Begin streaming — show the bar and name tag, start writing.
   */
  startAegisResponse(): void {
    process.stdout.write(`  ${AEGIS_BAR} ${AEGIS_LABEL}  `);
    this.isStreaming = true;
  }

  /**
   * Stream a token. Characters appearing, like someone typing.
   */
  streamToken(token: string): void {
    if (this.isStreaming) {
      process.stdout.write(token);
    }
  }

  /**
   * End streaming. Close out the bar and add breathing room.
   */
  endAegisResponse(): void {
    if (this.isStreaming) {
      console.log("");
      console.log(`  ${AEGIS_BAR}`);
      console.log("");
      this.isStreaming = false;
    }
  }

  /**
   * Get input from the human.
   * Green bar + label, dimmed input text for visual weight hierarchy.
   */
  async getUserInput(): Promise<string> {
    return new Promise((resolve) => {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      this.rl.question(`  ${YOU_BAR} ${YOU_LABEL}    `, (answer) => {
        this.rl?.close();
        this.rl = null;
        console.log("");
        resolve(answer);
      });
    });
  }

  // ── Thinking Animations ────────────────────────────────────────────

  /**
   * Start the thinking sequence. Sets a 2-second timer.
   * If stopThinking() is called before the timer fires, nothing appears.
   * If the timer fires, a terminal-width-safe animation starts looping.
   */
  startThinking(): void {
    this.thinkingTimer = setTimeout(() => {
      this.thinkingTimer = null;
      this.beginAnimation();
    }, 2000);
  }

  /**
   * Stop thinking. Cancels the timer or clears the animation.
   * Leaves the terminal clean for the next output.
   */
  stopThinking(): void {
    // Cancel timer if it hasn't fired
    if (this.thinkingTimer) {
      clearTimeout(this.thinkingTimer);
      this.thinkingTimer = null;
      return;
    }

    // Stop animation if running
    if (this.isAnimating) {
      this.clearAnimation();
    }
  }

  /**
   * Begin a thinking animation loop.
   *
   * Checks terminal width to pick a safe animation:
   * - Narrow terminals (< 54 cols) always get the compact shield pulse
   * - Wide terminals get a random pick from all animations
   *
   * Each frame is clamped to terminal width before drawing so lines
   * never wrap and the cursor math stays correct.
   */
  private beginAnimation(): void {
    const cols = getTerminalWidth();

    let animations: string[][];
    if (cols < MIN_WIDTH_FOR_ASSEMBLY) {
      // Narrow terminal — only use the compact pulse animation
      animations = [SHIELD_PULSE_FRAMES];
    } else {
      animations = THINKING_ANIMATIONS;
    }

    const animIndex = Math.floor(Math.random() * animations.length);
    this.currentAnimation = animations[animIndex];
    this.currentFrameIndex = 0;
    this.isAnimating = true;
    this.linesDrawn = 0;

    // Draw first frame
    this.drawFrame();

    // Loop through frames
    this.thinkingInterval = setInterval(() => {
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.currentAnimation!.length;
      this.redrawFrame();
    }, 600);
  }

  /**
   * Draw the current animation frame.
   * Clamps each line to terminal width to prevent wrapping.
   * Tracks actual lines drawn for safe cursor math on redraw.
   */
  private drawFrame(): void {
    if (!this.currentAnimation) return;
    const frame = this.currentAnimation[this.currentFrameIndex];
    const cols = getTerminalWidth();

    // Clamp each line to terminal width — prevents wrapping that
    // would throw off cursor math on redraw
    const clamped = frame
      .split("\n")
      .map((line) => clampLine(line, cols))
      .join("\n");

    const colored = colorizeThinking(clamped);
    process.stdout.write(colored);
    this.linesDrawn = THINKING_FRAME_HEIGHT;
  }

  /**
   * Redraw: move cursor up by the number of lines we actually drew,
   * clear them, draw the new frame.
   */
  private redrawFrame(): void {
    if (!this.currentAnimation) return;

    // Move cursor up and clear each line we drew
    for (let i = 0; i < this.linesDrawn; i++) {
      process.stdout.write("\x1b[A"); // cursor up
      process.stdout.write("\x1b[2K"); // clear line
    }

    this.drawFrame();
  }

  /**
   * Clear the animation completely and reset state.
   * Uses tracked line count + a safety sweep to catch any ghost lines.
   */
  private clearAnimation(): void {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }

    // Clear the animation lines we actually drew
    if (this.isAnimating && this.linesDrawn > 0) {
      for (let i = 0; i < this.linesDrawn; i++) {
        process.stdout.write("\x1b[A"); // cursor up
        process.stdout.write("\x1b[2K"); // clear line
      }
      // Safety sweep — clear from cursor to end of screen to catch
      // any ghost lines from wrapped text or frame size mismatches
      process.stdout.write("\x1b[J");
    }

    this.isAnimating = false;
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.linesDrawn = 0;
  }

  // ── System Messages ────────────────────────────────────────────────

  /**
   * A quiet note — not from Aegis, just the system.
   * Used sparingly.
   */
  showNote(message: string): void {
    console.log(`  ${DIM(message)}\n`);
  }

  /**
   * Show the files that were created — minimal, factual.
   */
  showFilesCreated(files: string[]): void {
    console.log("");
    for (const file of files) {
      console.log(`  ${DIM("\u2192")} ${DIM(file)}`);
    }
    console.log("");
  }

  /**
   * ANSI visual element — only called when Aegis has conversationally
   * introduced it. The "whiteboard sketch" capability.
   */
  showVisual(content: string): void {
    const lines = content.split("\n").map((line) => `  ${DIM(line)}`);
    console.log("");
    console.log(lines.join("\n"));
    console.log("");
  }

  /**
   * Show an error — still conversational, not alarming.
   */
  showError(message: string): void {
    console.log(`\n  ${message}\n`);
  }

  /**
   * Clean up.
   */
  destroy(): void {
    this.stopThinking();
    this.rl?.close();
  }
}

// ── Helper Functions ───────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearScreen(): void {
  process.stdout.write("\x1b[2J\x1b[H");
}

/**
 * Get terminal width, with a safe fallback.
 */
function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Get the usable width for word-wrapping message text.
 * Accounts for the left-side bar + label + padding (~12 chars).
 */
function getWrapWidth(): number {
  return Math.max(40, getTerminalWidth() - 14);
}

/**
 * Word-wrap text to a given width. Breaks on spaces to avoid
 * splitting words mid-line. Preserves existing newlines.
 */
function wrapText(text: string, width: number): string {
  return text
    .split("\n")
    .map((paragraph) => {
      if (paragraph.length <= width) return paragraph;

      const words = paragraph.split(" ");
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        if (current.length === 0) {
          current = word;
        } else if (current.length + 1 + word.length <= width) {
          current += " " + word;
        } else {
          lines.push(current);
          current = word;
        }
      }
      if (current.length > 0) lines.push(current);

      return lines.join("\n");
    })
    .join("\n");
}

/**
 * Clamp a line to a maximum character width.
 * Strips ANSI codes for measurement, then truncates the raw string
 * if the visible length exceeds the limit.
 */
function clampLine(line: string, maxWidth: number): string {
  // Strip ANSI escape codes for accurate length measurement
  const visible = line.replace(/\x1b\[[0-9;]*m/g, "");
  if (visible.length <= maxWidth) return line;

  // Truncate the raw string — this is imperfect with ANSI codes
  // but safe enough since we're only clamping animation frames
  // (which are colorized after clamping, not before)
  return line.slice(0, maxWidth);
}

/**
 * Add color to the Aegis logo. Block letters get the aegis blue,
 * tagline stays dim.
 */
function colorizeLogo(text: string): string {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      // Tagline line
      if (line.includes("governance for ai agents")) {
        return DIM(line);
      }
      // Block letter lines (contain box-drawing characters)
      if (
        line.includes("\u2588") ||
        line.includes("\u2554") ||
        line.includes("\u2557") ||
        line.includes("\u255A") ||
        line.includes("\u255D") ||
        line.includes("\u2550")
      ) {
        return AEGIS_COLOR(line);
      }
      return line;
    })
    .join("\n");
}

/**
 * Add color to thinking animation frames.
 * Shield outline gets aegis blue, diamonds/checkmarks get distinct colors,
 * file tree and labels stay dim, "ready" gets accent color.
 */
function colorizeThinking(text: string): string {
  return text
    .replace(/\u25C7/g, DIM("\u25C7"))                    // empty diamond — dim
    .replace(/\u25C6/g, PROGRESS("\u25C6"))               // filled diamond — gold (in progress)
    .replace(/\u2713/g, CHECK("\u2713"))                   // checkmark — green
    .replace(/ready/g, CHECK("ready"))                     // "ready" label — green
    .replace(/thinking\.\.\./g, DIM("thinking..."))        // thinking label — dim
    .replace(/scanning repo\.\.\./g, DIM("scanning repo...")) // scanning label — dim
    .replace(/\.agentpolicy\//g, ACCENT(".agentpolicy/"))  // directory name — blue
    .replace(/\u25B3/g, ACCENT("\u25B3"))                  // triangle top — blue
    .replace(/V/g, ACCENT("V"));                           // V bottom — blue
}
