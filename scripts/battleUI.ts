import {Character} from "./character";

const canvas = document.createElement("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const DEFAULT_BAR_WIDTH_PX = 260;   // default width of HP bar
const DEFAULT_BAR_HEIGHT_PX = 26;   // default height of HP bar
const DEFAULT_BORDER_RADIUS_PX = 6; // rounded corners
const DEFAULT_TOP_OFFSET = "6%";    // percent from top for top-positioned bars
const DEFAULT_BOTTOM_OFFSET = "6%"; // percent from bottom for bottom-positioned bars
const DEFAULT_Z_INDEX = 1001;       // ensure bars sit above most UI
const DEFAULT_TRANSITION_MS = 300;  // smooth width transitions for inner bar
const MAX_VIGNETTE_HEALTH_CAP = 100; // scale vignette relative to this cap

if (!document.body.contains(canvas)) {
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = String(DEFAULT_Z_INDEX - 1);
    document.body.appendChild(canvas);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Draws a radial red overlay based on missing health
 */
export class Vignette {
    private drawVignette(damage: number) {
        const width = canvas.width;
        const height = canvas.height;

        // radial gradient centered on screen, radius to cover entire viewport
        const radius = Math.max(width, height) / 2;
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);

        gradient.addColorStop(0, "rgba(134, 0, 0, 0)"); // transparent center
        // damage normalized to [0..1] for alpha
        const alpha = Math.max(0, Math.min(1, damage / MAX_VIGNETTE_HEALTH_CAP));
        gradient.addColorStop(1, `rgba(134, 0, 0, ${alpha})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Updater for vignette
     * @param character Player
     */
    updateVignette(character: Character) {
        const effectiveCap = Math.max(character.healthCap, 1);
        const scale = MAX_VIGNETTE_HEALTH_CAP / effectiveCap;

        const scaledHealthCap = character.healthCap * scale;
        const scaledHealth = character.health * scale;

        const damage = Math.max(0, scaledHealthCap - scaledHealth);

        // clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (damage > 0) {
            this.drawVignette(damage);
        }
    }
}

/**
 * Manager for creating and updating health bars
 */
export class HealthBar {
    /**
     * Method for creation health bars
     * @param character Character for which will be created health bar
     * @param position Position of health bar
     * ‎ ‎ Use values such a "top" and "bottom"
     * @param label Text label for health bar
     */
    createHpBar(character: Character, position: "top" | "bottom" = "top", label?: string) {
        // Outer container
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.left = "50%";
        container.style.transform = "translateX(-50%)";
        container.style.width = `${DEFAULT_BAR_WIDTH_PX}px`;
        container.style.height = `${DEFAULT_BAR_HEIGHT_PX}px`;
        container.style.border = "1px solid rgba(0,0,0,0.6)";
        container.style.background = "rgba(0,0,0,0.35)"; // dark translucent base for contrast
        container.style.mixBlendMode = "normal"; // avoid blending with page background
        container.style.backdropFilter = "blur(4px)"; // soft blur so underlying content doesn't show through sharply
        container.style.border = "1px solid rgba(255,255,255,0.12)"; // light outline for dark pages
        container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)"; // extra separation
        container.style.borderRadius = `${DEFAULT_BORDER_RADIUS_PX}px`;
        container.style.overflow = "hidden";
        container.style.zIndex = String(DEFAULT_Z_INDEX);
        // Positioning (top or bottom)
        container.style.top = position === "top" ? DEFAULT_TOP_OFFSET : "";
        container.style.bottom = position === "bottom" ? DEFAULT_BOTTOM_OFFSET : "";

        // Inner (colored) bar which changes width
        const inner = document.createElement("div");
        inner.style.height = "100%";
        inner.style.width = "100%"; // full health at start
        inner.style.transition = `width ${DEFAULT_TRANSITION_MS}ms linear, background ${DEFAULT_TRANSITION_MS}ms linear`;
        inner.style.background = HealthBar.composeGradientForPercent(100);

        // Text overlay which shows numeric health and custom text
        const text = document.createElement("div");
        text.style.position = "absolute";
        text.style.top = "50%";
        text.style.left = "50%";
        text.style.transform = "translate(-50%, -50%)";
        text.style.fontFamily = "sans-serif";
        text.style.fontSize = "13px";
        text.style.color = "white";
        text.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";
        text.style.pointerEvents = "none";
        text.innerText = label ? `${label}: 0 / 0` : `0 / 0`;

        // Append elements
        container.appendChild(inner);
        container.appendChild(text);

        // Attach to character
        character.healthBar = container;
        character.innerBar = inner;
        character.healthText = text;

        // Add to DOM
        document.body.appendChild(container);

        // Initial update based on current health
        this.updateHealthBar(character);
    }


    /**
     * Updater for health bar
     * @param character Character which health bar will be updated
     */
    updateHealthBar(character: Character) {
        if (!character.innerBar || !character.healthText) return;

        // Clamp between 0 and 100 and compute percent string
        const percent = Math.max(0, Math.min(100, (character.health / Math.max(character.healthCap, 1)) * 100));

        // Update inner bar width and gradient coloring based on percent
        character.innerBar.style.width = `${percent}%`;
        character.innerBar.style.background = HealthBar.composeGradientForPercent(percent);

        // Numeric text. "Current health / Max health"
        const labelPrefix = character.name ? `${character.name}: ` : "";
        character.healthText.innerText = `${labelPrefix}${Math.round(character.health)} / ${Math.round(character.healthCap)}`;
    }

    // Helper to compute a gradient string based on percent health (green -> yellow -> red)
    private static composeGradientForPercent(percent: number) {
        // Interpolate colors roughly:
        // >60% green, 30-60% yellowish, <30% red
        const p = Math.max(0, Math.min(100, percent));

        if (p > 70) {
            // Green
            return `linear-gradient(to right, #32CD32 ${p}%, #98FB98 ${p}%, rgba(255,0,0,0) ${p + 0.1}%)`;
        } else if (p > 30) {
            // Yellow
            return `linear-gradient(to right, #FFD700 ${p}%, #FFA500 ${p}%, rgba(255,0,0,0) ${p + 0.1}%)`;
        } else {
            // Red
            return `linear-gradient(to right, #FF4D4F ${p}%, #FF7A7A ${p}%, rgba(255,0,0,0) ${p + 0.1}%)`;
        }
    }
}
