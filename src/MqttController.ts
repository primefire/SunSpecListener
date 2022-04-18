import mqtt from 'mqtt';
import TotalPowerReading from './Models/TotalPowerReading';

const BASE_TOPIC = 'solaredge';

export default class MqttController {
	private client!: mqtt.MqttClient;

	constructor(private ipAddress: string, private port: number, private user: string, private password: string, private id: string) {}

	async connect(): Promise<void> {
		this.client = mqtt.connect(`mqtt://${this.ipAddress}:${this.port}`, {
			clientId: `sunspeclistener_${this.id}`,
			clean: true,
			connectTimeout: 4000,
			username: this.user,
			password: this.password,
			reconnectPeriod: 1000
		});
	}

	async sendCurrentPowerUpdate(totalPowerReading: TotalPowerReading): Promise<void> {
		this.client.publish(`${BASE_TOPIC}/${this.id}/current`, JSON.stringify(totalPowerReading));
	}
}
