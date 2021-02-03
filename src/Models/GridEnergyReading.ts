export default class EnergyReading {
	energyImported: number;
	energyExported: number;

	constructor(energyImported: number, energyExported: number) {
		this.energyImported = energyImported;
		this.energyExported = energyExported;
	}
}
