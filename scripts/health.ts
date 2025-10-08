import {Character} from "./character";
import {HealthBar, Vignette} from "./battleUI";

export let player: Character;
export let enemy: Character;
export let vignette: Vignette;
export let healthBar: HealthBar;

export function initBattleUI() {
    player = new Character("Player",100, 100, 0, 5, null)
    enemy = new Character("Niko",100, 100, 0, 5, 0)
    vignette = new Vignette();
    healthBar = new HealthBar();

    healthBar.createHpBar(player, "top", "Player");
    healthBar.createHpBar(enemy, "bottom", "Niko");
}
