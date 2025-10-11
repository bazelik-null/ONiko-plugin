import { enemy, player, vignette } from "./battleUI";
import { LineData } from "./utils";

let helpers: Helpers;
export let effects: Effects;

export let lineHazard: LineHazard;
export let squareHazard: SquareHazard;
export let homingHazard: HomingHazard;

export function initHazards() {
    effects = new Effects();
    helpers = new Helpers();

    lineHazard = new LineHazard();
    squareHazard = new SquareHazard();
    homingHazard = new HomingHazard();
}

export class Helpers {
    private static readonly DAMAGE_COOLDOWN = 50;

    private damageTimeout: number | null = null;

    public applyBaseElementStyle(el: HTMLElement, z = 1000) {
        el.style.position = "absolute";
        el.style.zIndex = String(z);
    }

    public attacker() {
        enemy.attacker(player, enemy, 0);
        vignette.updateVignette(player);
        effects.createGlitchElements();
        this.damageTimeout = window.setTimeout(() => {
            this.damageTimeout = null;
        }, Helpers.DAMAGE_COOLDOWN) as unknown as number;
    }
}

export class Effects {
    private static readonly GLITCH_SIZE = 128;
    private static readonly GLITCH_DURATION = 1000;

    public createGlitchElements(isPermanent = false) {
        if (player.isDead || enemy.isDead) return;

        const count = 3;
        const elements: HTMLDivElement[] = [];

        for (let i = 0; i < count; i++) {
            const div = document.createElement("div");
            helpers.applyBaseElementStyle(div, 9999);

            div.style.width = `${Effects.GLITCH_SIZE}px`;
            div.style.height = `${Effects.GLITCH_SIZE}px`;
            div.style.backgroundImage = `url(${browser.runtime.getURL("img/glitch.png")})`;
            div.style.backgroundSize = "cover";
            // place randomly
            div.style.top = `${Math.random() * 100}vh`;
            div.style.left = `${Math.random() * 100}vw`;
            div.style.opacity = "1";
            div.style.backgroundColor = "transparent";
            document.body.appendChild(div);
            elements.push(div);
        }

        if (isPermanent) return;

        window.setTimeout(() => {
            elements.forEach((el) => el.remove());
        }, Effects.GLITCH_DURATION);
    }
}

export class LineHazard {
    private static readonly WARN_DURATION = 1000;
    private static readonly LINE_DURATION = 1000;
    private static readonly LINE_THICKNESS = 25;

    private lines: LineData[] = [];
    private damageTimeout: number | null = null;

    private mouseX = 0;
    private mouseY = 0;

    public createWarnLine() {
        const warn = document.createElement("div");
        const isHorizontal = Math.random() > 0.5;

        helpers.applyBaseElementStyle(warn, 1000);
        warn.style.backgroundColor = "rgba(66, 0, 128, 0.5)";

        if (isHorizontal) {
            // horizontal line
            warn.style.height = "10px";
            warn.style.width = "100vw";
            warn.style.top = `${Math.floor(Math.random() * (window.innerHeight - 1))}px`;
            warn.style.left = "0px";
        } else {
            // vertical line
            warn.style.height = "100vh";
            warn.style.width = "10px";
            warn.style.top = "0px";
            warn.style.left = `${Math.floor(Math.random() * (window.innerWidth - 1))}px`;
        }

        document.body.appendChild(warn);

        const lineData = new LineData(isHorizontal, parseFloat(warn.style.left), parseFloat(warn.style.top));

        window.setTimeout(() => {
            this.createLine(warn, lineData);
            warn.remove();
        }, LineHazard.WARN_DURATION);
    }

    private createLine(warn: HTMLDivElement, lineData: LineData) {
        const line = document.createElement("div");
        helpers.applyBaseElementStyle(line, 1000);
        line.style.backgroundColor = "rgb(66, 0, 128)";

        line.style.width = `${LineHazard.LINE_THICKNESS}px`;
        line.style.height = "100vh";
        line.style.top = "0px";
        line.style.left = warn.style.left;

        // switch dimensions if warn line is horizontal
        if (warn.style.width === "100vw") {
            line.style.width = "100vw";
            line.style.height = `${LineHazard.LINE_THICKNESS}px`;
            line.style.top = warn.style.top;
            line.style.left = "0px";
        }

        document.body.appendChild(line);

        this.lines.push(lineData);

        window.setTimeout(() => {
            line.remove();
            const idx = this.lines.findIndex(
                (ld) => ld.isHorizontal === lineData.isHorizontal && ld.x === lineData.x && ld.y === lineData.y
            );
            if (idx !== -1) this.lines.splice(idx, 1);
        }, LineHazard.LINE_DURATION);
    }

    public checkLineCollision() {
        if (this.damageTimeout !== null) return;

        for (const line of this.lines) {
            if (line.isHorizontal) {
                const distance = Math.abs(line.y - this.mouseY);
                if (distance < LineHazard.LINE_THICKNESS / 2) {
                    helpers.attacker();
                    break;
                }
            } else {
                const distance = Math.abs(line.x - this.mouseX);
                if (distance < LineHazard.LINE_THICKNESS / 2) {
                    helpers.attacker();
                    break;
                }
            }
        }
    }

    constructor() {
        document.addEventListener("mousemove", (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
}

export class SquareHazard {
    private static readonly SQUARE_SIZE = 20;
    private static readonly SQUARE_STEP = 5;
    private static readonly SQUARE_TICK = 50;
    private static readonly SQUARE_HORIZONTAL_SPEED = 5;

    public createSquare() {
        const square = document.createElement("div");
        helpers.applyBaseElementStyle(square, 1000);
        square.style.backgroundColor = "rgb(66, 0, 128)";
        square.style.width = `${SquareHazard.SQUARE_SIZE}px`;
        square.style.height = `${SquareHazard.SQUARE_SIZE}px`;
        square.style.top = "0px";
        square.style.left = `${Math.random() * (window.innerWidth - SquareHazard.SQUARE_SIZE)}px`;

        document.body.appendChild(square);

        let positionY = 0;
        let positionX = Math.random() < 0.5 ? -SquareHazard.SQUARE_HORIZONTAL_SPEED : SquareHazard.SQUARE_HORIZONTAL_SPEED;

        const tick = () => {
            positionY += SquareHazard.SQUARE_STEP;
            square.style.top = `${positionY}px`;

            const currentLeft = parseFloat(square.style.left);
            square.style.left = `${currentLeft + positionX}px`;

            // Bounce horizontally when reaching edge
            if (parseFloat(square.style.left) < 0 || parseFloat(square.style.left) > window.innerWidth - SquareHazard.SQUARE_SIZE) {
                positionX = -positionX;
            }

            if (positionY > window.innerHeight) {
                square.remove();
            } else {
                window.setTimeout(tick, SquareHazard.SQUARE_TICK);
            }
        };

        tick();

        square.addEventListener("mouseover", () => {
            enemy.attacker(player, enemy, 0);
            vignette.updateVignette(player);
            effects.createGlitchElements();
            square.remove();
        });
    }

    public createHeal() {
        const heal = document.createElement("div");
        helpers.applyBaseElementStyle(heal, 1000);
        heal.style.backgroundColor = "green";
        heal.style.width = `${SquareHazard.SQUARE_SIZE}px`;
        heal.style.height = `${SquareHazard.SQUARE_SIZE}px`;
        heal.style.top = "0px";
        heal.style.left = `${Math.random() * (window.innerWidth - SquareHazard.SQUARE_SIZE)}px`;

        document.body.appendChild(heal);

        let positionY = 0;
        let positionX = Math.random() < 0.5 ? - SquareHazard.SQUARE_HORIZONTAL_SPEED : SquareHazard.SQUARE_HORIZONTAL_SPEED;

        const tick = () => {
            positionY += SquareHazard.SQUARE_STEP;
            heal.style.top = `${positionY}px`;

            const currentLeft = parseFloat(heal.style.left);
            heal.style.left = `${currentLeft + positionX}px`;

            if (parseFloat(heal.style.left) < 0 || parseFloat(heal.style.left) > window.innerWidth - SquareHazard.SQUARE_SIZE) {
                positionX = -positionX;
            }

            if (positionY > window.innerHeight) {
                heal.remove();
            } else {
                window.setTimeout(tick, SquareHazard.SQUARE_TICK);
            }
        };

        tick();

        heal.addEventListener("mouseover", () => {
            player.healer(player, 15);
            heal.remove();
        });
    }
}

export class HomingHazard {
    private static readonly HOMING_SPEED = 5;
    private static readonly HOMING_LIFETIME = 3000;
    private static readonly HOMING_HIT_RADIUS = 30;

    private mouseX = 0;
    private mouseY = 0;

    public createHoming() {
        const homing = document.createElement("div");
        helpers.applyBaseElementStyle(homing, 1000);
        homing.style.width = "0";
        homing.style.height = "0";
        homing.style.borderLeft = "15px solid transparent";
        homing.style.borderRight = "15px solid transparent";
        homing.style.borderBottom = "30px solid rgb(66, 0, 128)";
        document.body.appendChild(homing);

        let homingX = Math.random() * window.innerWidth;
        let homingY = Math.random() * window.innerHeight;

        homing.style.left = `${homingX}px`;
        homing.style.top = `${homingY}px`;

        let alive = true;
        const startTime = performance.now();

        const step = () => {
            if (!alive) return;

            // compute vector from homing to current mouse position
            const dx = this.mouseX - homingX;
            const dy = this.mouseY - homingY;
            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                // normalized vector scaled by speed constant
                const vx = (dx / dist) * HomingHazard.HOMING_SPEED;
                const vy = (dy / dist) * HomingHazard.HOMING_SPEED;

                homingX += vx;
                homingY += vy;

                // rotate to face target (add 90 deg because shape points down initially)
                const angle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
                homing.style.transform = `rotate(${angle}deg)`;

                homing.style.left = `${homingX}px`;
                homing.style.top = `${homingY}px`;
            }

            // collision check
            const hit = Math.hypot(homingX - this.mouseX, homingY - this.mouseY) < HomingHazard.HOMING_HIT_RADIUS;

            if (hit) {
                enemy.attacker(player, enemy, 0);
                vignette.updateVignette(player);
                homing.remove();
                effects.createGlitchElements();
                alive = false;
                return;
            }

            if (performance.now() - startTime > HomingHazard.HOMING_LIFETIME) {
                homing.remove();
                alive = false;
                return;
            }

            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }

    constructor() {
        document.addEventListener("mousemove", (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
}