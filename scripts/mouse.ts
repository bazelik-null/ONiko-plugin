import {oniko} from "./content";

export class Mouse {
    public x: number;
    public y: number;

    public calculateDiff() : [number, number] {
        const diffX = oniko.x - (this.x || oniko.x);
        const diffY = oniko.y - (this.y || oniko.y);

        return [diffX, diffY];
    }

    public calculateDistance(diffArr: [number, number]) : number {
        let diffX = diffArr[0]
        let diffY = diffArr[1]

        return Math.hypot(diffX, diffY);
    }

    public calculateVector(distance: number, diffArr: [number, number]) : [number, number] {
        let diffX = diffArr[0]
        let diffY = diffArr[1]

        const normalizedX = diffX / distance;
        const normalizedY = diffY / distance;

        return [normalizedX, normalizedY];
    }

    public getDirection(normalizedArr: [number, number]) : string {
        let normalizedX = normalizedArr[0];
        let normalizedY = normalizedArr[1];

        if (normalizedY > 0.5) {
            oniko.direction = "N";
        } else if (normalizedY < -0.5) {
            oniko.direction = "S";
        } else if (normalizedX > 0.5) {
            oniko.direction = "W";
        } else if (normalizedX < -0.5) {
            oniko.direction = "E";
        }
        return oniko.direction;
    }

    constructor() {
        this.x = 0;
        this.y = 0;
    }
}