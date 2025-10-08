import {healthBar} from "./health";

export class Character {
    name: string;

    healthText: HTMLDivElement;
    healthBar: HTMLDivElement
    innerBar: HTMLDivElement

    health: number;
    healthCap: number;
    resistance: number;
    damage: number;
    phase: number | null;

    isDead: boolean = false;

    /**
     * Function for damaging the character. <br>
     * If health becomes less or equal to zero character will die and health will be set to zero.
     * @param character Character to damage
     * @param amount Damage amount
     */
    damager(character: Character, amount: number) {
        if (character.isDead) {
            return
        }

        character.health -= amount * (1 - character.resistance);

        if (character.health <= 0) {
            character.isDead = true;
            character.health = 0;
        }

        healthBar.updateHealthBar(character);

        return
    }

    /**
     * Function for healing the character. <br>
     * If healing overflows past healthCap it will set to healthCap.
     * @param character Character to heal
     * @param amount Heal amount
     */
    healer(character: Character, amount: number) {
        if (character.isDead) {
            return
        }

        character.health += amount;

        if (character.health > character.healthCap) {
            character.health = character.healthCap;
        }

        healthBar.updateHealthBar(character);

        return
    }

    /**
     * Function for attacking another character
     * @param enemy Enemy to attack
     * @param character Attacker
     * @param damageOverride Damage number to use instead of standard <br>
     * Set damageOverride value to zero if you want to use standard character damage
     */
    attacker(enemy: Character, character: Character, damageOverride: number) {
        if (damageOverride === 0) {
            enemy.damager(enemy, character.damage)
        } else {
            enemy.damager(enemy, damageOverride);
        }
    }

    /**
     * @param name Name of the character
     * @param health Starting health
     * @param healthCap Maximum health
     * @param resistance Resistance to damage. <br>
     * ‎ ‎ 0 = No reduction, 1 = Full immunity.
     * @param damage Default damage from character
     * @param phase Phase for enemy. <br>
     * ‎ ‎ Set value to null for players.
     */
    constructor(name: string, health: number, healthCap: number, resistance: number, damage: number, phase: number | null) {
        this.healthText = document.createElement('div');
        this.healthBar = document.createElement('div');
        this.innerBar = document.createElement('div');

        this.name = name;
        this.health = health;
        this.healthCap = healthCap;
        this.resistance = resistance;
        this.damage = damage;
        this.phase = phase;
    }
}