export class Oniko {
    public direction: string;
    public x: number;
    public y: number;

    public width: number;
    public height: number;

    public speed: number;
    public sleepFrameSpeed: number;
    public idleTime: number;
    public movementType: string;

    public frameCount = 0;
    public sleepFrameCount = 0;
    public lastFrameTimestamp: number;
    public sleepTimer: NodeJS.Timeout | null = null;

    public isSleeping: boolean;
    public isBlocked: boolean;

    constructor() {
        this.direction = "";
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.speed = 0;
        this.sleepFrameSpeed = 0;
        this.frameCount = 0;
        this.sleepFrameCount = 0;
        this.lastFrameTimestamp = 0;
        this.sleepTimer = null;
        this.idleTime = 0;
        this.movementType = "";
        this.isSleeping = false;
        this.isBlocked = false;
    }
}