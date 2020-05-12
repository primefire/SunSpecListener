const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let clientIP = '192.168.0.43';
let clientPort = 502;

http.listen(3010, function(){
    console.log('Server listening on port 3010');
});

io.on('connection', function(socket){
    console.log('client connected');
});

client.connectTCP(clientIP, { port: clientPort });
client.setID(1);
console.log(`connected to Inverter at ${clientIP}:${clientPort}`);

setInterval(function() {
    let power = 0;
    let scalefactor = 0;
    let production = 0;
    client.readHoldingRegisters(40083, 1, function(err, data) {
        if (err) console.error(err)
        console.log("data 40084:", data);
        power = convertResult(data.data[0])

        client.readHoldingRegisters(40084, 1, function(err, data) {
            if (err) console.error(err)
            console.log("data 40085:", data);
            scalefactor = convertResult(data.data[0])

            production = power * Math.pow(10, scalefactor);
            console.log("power", power)
            console.log("scalefactor", scalefactor)
            console.log("Aktuelle Produktion:", production, "W")
            io.emit('currentProduction', production);
        });
    });
}, 1000);

function convertResult(res) {
    a = '0x' + (res+0x10000).toString(16).substr(-4).toUpperCase();
    a = parseInt(a, 16);
    if ((a & 0x8000) > 0) {
        a = a - 0x10000;
    }
    return a;
}