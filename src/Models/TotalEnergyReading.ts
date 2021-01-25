export default class EnergyReading {
    energyProduced: number;
    energyImported: number;
    energyExported: number;
    timestamp: Date;

    constructor(energyProduced: number, energyImported: number, energyExported: number, timestamp: Date, ) {
        this.energyProduced = energyProduced;
        this.energyImported = energyImported;
        this.energyExported = energyExported;
        this.timestamp = timestamp;
    }
}