export class LineData {
    isHorizontal: boolean;
    x: number;
    y: number;

    constructor(isHorizontal: boolean, x: number, y: number) {
        this.isHorizontal = isHorizontal;
        this.x = x;
        this.y = y;
    }
}