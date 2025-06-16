export class LineData {
    constructor(isHorizontal, x, y) {
        this.isHorizontal = isHorizontal;
        this.x = x;
        this.y = y;
    }
}

export class HomingData {
    constructor(x, y, homing) {
        this.x = x;
        this.y = y;
        this.homing = homing;
    }
}