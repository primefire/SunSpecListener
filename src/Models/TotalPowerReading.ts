import PowerReading from "./PowerReading";

export default class TotalPowerReading {
    production: PowerReading;
    grid: PowerReading;
    timestamp: Date;

    constructor(production: PowerReading, grid: PowerReading, timestamp: Date) {
        this.production = production;
        this.grid = grid;
        this.timestamp = timestamp;
    }
}