import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import TotalEnergyReading from './Models/TotalEnergyReading';
import TotalPowerReading from './Models/TotalPowerReading';

export default class SocketIoServer {
    private app!: express.Application;
    private httpServer!: http.Server;
    private io!: SocketIO.Server;

    private port!: number;

    constructor(port: number) {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = SocketIO(this.httpServer);
        this.port = port;
    }

    startServer(): void {
        this.httpServer.listen(this.port);
    }

    sendCurrentPowerReading(reading: TotalPowerReading): void {
        this.io.emit('current', reading);
    }

    sendTotalEnergyReading(reading: TotalEnergyReading): void {
        this.io.emit('total', reading);
    }

}