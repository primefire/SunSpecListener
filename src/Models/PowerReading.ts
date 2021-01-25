export default class PowerReading {
    wattage: number;
    voltage: number;
    amperage: number;
    
    constructor(wattage: number, voltage: number, amperage: number) {
        this.wattage = wattage;
        this.voltage = voltage;
        this.amperage = amperage;
        
    }
}