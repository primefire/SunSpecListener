import ModbusConnection from 'modbus-serial';
import PowerReading from "./Models/PowerReading";
import TotalEnergyReading from './Models/TotalEnergyReading';
import TotalPowerReading from "./Models/TotalPowerReading";

export default class ModbusController {
    private modbusConnection: ModbusConnection;
    private ipAddress!: string;
    private port!: number;
    
    constructor (ipAddress: string, port: number) {
        this.modbusConnection = new ModbusConnection();
        this.ipAddress = ipAddress;
        this.port = port;
    }

    async connectToModbusDevice(): Promise<void> {
        try {
            await this.modbusConnection.connectTCP(this.ipAddress, { port: this.port });
            this.modbusConnection.setID(1);
        } catch (e) {
            throw new Error('Modbus Connection could not be established.')
        }
    }

    async getCurrentData(): Promise<TotalPowerReading> {
        let solarData = await this.getCurrentSolarData();
        let gridData = await this.getCurrentGridData();
        let timestamp = new Date();

        return new TotalPowerReading(solarData, gridData, timestamp);
    }

    async getCurrentSolarData(): Promise<PowerReading> {
        let wattage = await this.getCurrentSolarWattage();
        let voltage = await this.getCurrentSolarVoltage();
        let amperage = this.calculateAmperage(voltage, wattage);
        

        return new PowerReading(wattage, voltage, amperage);
    }

    private async getCurrentSolarWattage(): Promise<number> {
        let wattageRegisters = await this.modbusConnection.readHoldingRegisters(40083, 2);
        let wattageBase = this.convertResultToSignedInteger(wattageRegisters.data[0]);
        let wattageScalefactor = this.convertResultToSignedInteger(wattageRegisters.data[1]);
        let wattage = wattageBase * Math.pow(10, wattageScalefactor);
        return wattage;
    }

    private async getCurrentSolarVoltage(): Promise<number> {
        let voltageRegisters = await this.modbusConnection.readHoldingRegisters(40079, 4);
        let voltageBase = this.convertResultToSignedInteger(voltageRegisters.data[0]);
        let voltageScalefactor = this.convertResultToSignedInteger(voltageRegisters.data[3]);
        let voltage = voltageBase * Math.pow(10, voltageScalefactor);
        return voltage;
    }

    async getCurrentGridData(): Promise<PowerReading> {
        let wattage = await this.getCurrentGridWattage();
        let voltage = await this.getCurrentGridVoltage();
        let amperage = this.calculateAmperage(voltage, wattage);

        return new PowerReading(wattage, voltage, amperage);
    }

    private async getCurrentGridWattage(): Promise<number> {
        let wattageRegisters = await this.modbusConnection.readHoldingRegisters(40206, 5);
	    let wattageBase = this.convertResultToSignedInteger(wattageRegisters.data[0]);
	    let wattageScalefactor = this.convertResultToSignedInteger(wattageRegisters.data[4]);
        let wattage = wattageBase * Math.pow(10, wattageScalefactor);
        return wattage * -1;
    }

    private async getCurrentGridVoltage(): Promise<number> {
        let voltageRegisters = await this.modbusConnection.readHoldingRegisters(40195, 9);
        let voltageBase = this.convertResultToSignedInteger(voltageRegisters.data[0]);
        let voltageScalefactor = this.convertResultToSignedInteger(voltageRegisters.data[8]);
        let voltage = voltageBase * Math.pow(10, voltageScalefactor);
        return voltage;
    }

    private calculateAmperage(voltage: number, wattage: number): number {
        let amperage = wattage/voltage;
        return amperage;
    }

    async getTotalEnergyData(): Promise<TotalEnergyReading> {
        let energyProduced = await this.getTotalSolarDataInKwh(); //todo returns weird value
        let energyImported = 0; //todo
        let energyExported = 0; //todo
        let timestamp = new Date();

        return new TotalEnergyReading(energyProduced, energyImported, energyExported, timestamp);
    }

    async getTotalSolarDataInKwh(): Promise<number> {
        let energyRegisters = await this.modbusConnection.readHoldingRegisters(40093, 3);
		let energyBase = parseInt(`${energyRegisters.data[0].toString(2)}${energyRegisters.data[1].toString(2)}`, 2);
		let energyScalefactor = this.convertResultToSignedInteger(energyRegisters.data[2]);
        let energy = Math.floor(energyBase * Math.pow(10, energyScalefactor))/1000;
        return energy;
    }

    private convertResultToSignedInteger(result: number): number {
        let a = '0x' + (result + 0x10000).toString(16).substr(-4).toUpperCase();
        let b = parseInt(a, 16);
        if ((b & 0x8000) > 0) {
            b = b - 0x10000;
        }
        return b;
    }
}