const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const fs = require('fs');

let config = JSON.parse(fs.readFileSync('config.json'));
if (config.modbusIpAddress == null) {
	console.error('Inverter Modbus IP address not configured');
	process.exit(1);
}
if (config.modbusPort == null) {
	console.error('Inverter Modbus port not configured');
	process.exit(1);
}
if (config.port == null) {
	console.error('port not configured');
	process.exit(1);
}

let clientIP = config.modbusIpAddress;
let clientPort = config.modbusPort;
let port = config.port;

http.listen(port, function () {
	console.log('Server listening on port', port);
});

io.on('connection', function (socket) {
	console.log('client connected');
});

client.connectTCP(clientIP, { port: clientPort });
client.setID(1);
console.log(`connected to Inverter at ${clientIP}:${clientPort}`);

setInterval(async () => {
	//current production power
	let powerData = await client.readHoldingRegisters(40083, 2);
	let powerAmount = convertResult(powerData.data[0]);
	let powerScaleFactor = convertResult(powerData.data[1]);
	let powerProduction = Math.floor(powerAmount * Math.pow(10, powerScaleFactor));

	//current production voltage
	let voltageData = await client.readHoldingRegisters(40079, 4);
	let voltageAmount = convertResult(voltageData.data[0]);
	let voltageScaleFactor = convertResult(voltageData.data[3]);
	let voltageProduction = voltageAmount * Math.pow(10, voltageScaleFactor);

	console.log('');
	let response = {
		production: {
			wattage: powerProduction,
			voltage: voltageProduction,
			amperage: powerProduction / voltageProduction,
		},
		grid: {
			//todo
			wattage: 0,
			voltage: 0,
			amperage: 0,
		},
	};
	console.log('current:');
	console.log(response);
	io.emit('current', response);
}, 1000);

setInterval(() => {
	//total power
	client.readHoldingRegisters(40093, 3, function (err, data) {
		if (err) console.error(err);
		let producedBinary = `${data.data[0].toString(2)}${data.data[1].toString(2)}`;
		let producedNumber = parseInt(producedBinary, 2);

		let scalefactor = convertResult(data.data[2]);
		let produced = Math.floor(producedNumber * Math.pow(10, scalefactor));
		console.log(produced, 'Wh');

		io.emit('total', produced);
	});
}, 60000);

function convertResult(res) {
	a = '0x' + (res + 0x10000).toString(16).substr(-4).toUpperCase();
	a = parseInt(a, 16);
	if ((a & 0x8000) > 0) {
		a = a - 0x10000;
	}
	return a;
}
