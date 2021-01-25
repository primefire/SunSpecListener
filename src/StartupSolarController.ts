import dotenv from 'dotenv';
import ModbusController from './ModbusController';
import SocketIoServer from './SocketIoServer';

export default class StartupSolarController {
    private modbusController!: ModbusController;
    private socketIoServer!: SocketIoServer;

    private intervalCounter!: number;

    constructor() {
        this.loadEnvironmentVariablesAndInterruptStartIfNotPresent();
        this.setupModbusConnection();
        this.setupSocketIoServer();
    }

    private loadEnvironmentVariablesAndInterruptStartIfNotPresent(): void {
        this.loadEnvironmentVariablesFromEnvFile()
        if (!this.areAllEnvironmentVariablesPresent()) {
            throw new Error('Not all mandatory environment variables are present.');
        }
    }

    private loadEnvironmentVariablesFromEnvFile(): void {
        dotenv.config();
    }

    private areAllEnvironmentVariablesPresent(): boolean {
        if (
			!process.env.MODBUS_IP_ADDRESS ||
			!process.env.MODBUS_PORT ||
            !process.env.SOCKET_IO_PORT ||
            !process.env.CURRENT_POWER_INTERVAL_MS ||
            !process.env.TOTAL_ENERGY_EVERY_X_TIMES_OF_CURRENT_POWER_INTERVAL
		) {
			return false;
		}
		return true;
    }

    private setupModbusConnection(): void {
        this.modbusController = new ModbusController(String(process.env.MODBUS_IP_ADDRESS!), Number(process.env.MODBUS_PORT!));
    }

    private setupSocketIoServer(): void {
        this.socketIoServer = new SocketIoServer(Number(process.env.SOCKET_IO_PORT!))
    }

    async startSolarController(): Promise<void> {
        console.log('Starting SolarController');
        await this.modbusController.connectToModbusDevice();
        console.log('Modbus connected');
        this.socketIoServer.startServer();
        console.log(`Socket.IO Server online on port ${process.env.SOCKET_IO_PORT}`);
        this.startCurrentPowerInterval();
        console.log(`Started Current Power Interval to repeat repeating after ${Number(process.env.CURRENT_POWER_INTERVAL_MS)/1000} second(s)`);
    }

    private startCurrentPowerInterval(): void {
        this.intervalCounter = 0;
        this.currentPowerInterval = this.currentPowerInterval.bind(this);
        setInterval(this.currentPowerInterval, Number(process.env.CURRENT_POWER_INTERVAL_MS));
    }

    private async currentPowerInterval(): Promise<void> {
        try {
            let currentData = await this.modbusController.getCurrentData();
            this.socketIoServer.sendCurrentPowerReading(currentData);
            console.log(currentData);

            if (this.intervalCounter === 0) {
                let totalEnergy = await this.modbusController.getTotalEnergyData();
                this.socketIoServer.sendTotalEnergyReading(totalEnergy);
                console.log(totalEnergy);
            }
        } catch (e) {
            console.error('Modbus request failed, restarting connection')
            await this.modbusController.connectToModbusDevice();
        }
        
        this.intervalCounter = (this.intervalCounter + 1) % Number(process.env.TOTAL_ENERGY_EVERY_X_TIMES_OF_CURRENT_POWER_INTERVAL);
    }

}