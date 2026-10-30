const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Servidor de Clavijero Activo\n');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

let turnosActuales = [];

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ tipo: 'actualizacion', datos: turnosActuales }));

    ws.on('message', (message) => {
        try {
            const paquete = JSON.parse(message);
            if (paquete.tipo === 'oficina') {
                turnosActuales = paquete.datos;
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ tipo: 'actualizacion', datos: turnosActuales }));
                    }
                });
            }
        } catch (e) {
            console.error("Error procesando mensaje:", e);
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});