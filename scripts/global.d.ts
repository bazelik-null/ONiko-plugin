interface Window {
    setNikoPosX: (value: number) => void;
    setNikoPosY: (value: number) => void;
    setNikoIsSleeping: (value: boolean) => void;
    setNikoIsBlocked: (value: boolean) => void;
    setFight: (value: boolean) => void;
    stopWheelEvent: () => void;
    isFight: boolean
}
