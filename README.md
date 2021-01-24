# SunSpecListener

Queries SunSpec compatible solar inverters (e.g. SolarEdge) using Modbus TCP for the current solar power production, current power import and current power export as well as total energy production, import and export.
It then makes theses values available to other services via Socket.IO.
(total import/export not yet implemented)

## Configuration

Edit `.env`.

```
MODBUS_IP_ADDRESS=192.168.0.XXX
MODBUS_PORT=502
SOCKET_IO_PORT=3010
CURRENT_POWER_INTERVAL_MS=1000
TOTAL_ENERGY_EVERY_X_TIMES_OF_CURRENT_POWER_INTERVAL=5
```

## Installation

Install all required packages using `npm install`

Then build the project using `npm run build`

Now you can start it using `node build/startSunSpecListener.js`
