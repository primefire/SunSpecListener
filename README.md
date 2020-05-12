# SunSpecListener
Queries SunSpec compatible solar inverters (e.g. SolarEdge) for the current solar power production and makes theses values available to other services.

## Installation

This server requires node.js with npm.
[node.js installation guide](https://crycode.de/installation-von-node-js)

Once you have node.js installed, just clone this repository and run `npm install`.

## Configuration

Step 1: Edit `config.json`.

```javascript
{
  "modbusIpAddress":"192.168.0.XXX",
  "modbusPort":502,
  "port":3010
}
```

### Modbus IP-address

Enter the local IP-Address of your Inverter.

### Modbus Port

Enter the Modbus-TCP port of your Inverter.

### Port

Enter a port for this server to run on.

## Deployment

I recommend using pm2. You can find more information on pm2 and an installation guide [here](https://pm2.keymetrics.io/docs/usage/quick-start/).

Once you have pm2 installed, start the server using the following command `pm2 start sunspeclistener.js`.
You can always just start the server using `node sunspeclistener.js` for testing purposes.
