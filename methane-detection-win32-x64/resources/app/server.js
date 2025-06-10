const Koa = require('koa');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('koa2-cors');
const Router = require('koa-router');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());

// 設置 Socket.io 的 CORS 配置
const io = socketIo(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // 前端應用運行的地址
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});

let latestData = {};
const DATA_COLLECTION_INTERVAL = 1000;
let collectedData = [];

app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(bodyParser());

app.use(serve(path.join(__dirname, 'public')));

// 提供 node_modules 中的資源
app.use(serve(path.join(__dirname, 'node_modules')));

router.get('/', async (ctx) => {
    ctx.body = 'Hello Koa';
});

router.post('/update-data', async (ctx) => {
    const data = ctx.request.body;
    const deviceId = data.deviceId || 'unknown';
    console.log('Received data from:', deviceId, data);

    if (!latestData[deviceId]) {
        latestData[deviceId] = { methane: 'N/A', hasNewData: false };
    }
    latestData[deviceId].methane = data.methane || 'N/A';
    latestData[deviceId].hasNewData = true;

    io.emit('data', { deviceId: deviceId, data: data });

    ctx.body = { status: 'success' };
});

setInterval(() => {
    const record = { time: new Date().toISOString() };
    Object.keys(latestData).forEach(deviceId => {
        record[`${deviceId}-methane`] = latestData[deviceId].hasNewData ? latestData[deviceId].methane : 'N/A';
        latestData[deviceId].hasNewData = false;
    });
    collectedData.push(record);
}, DATA_COLLECTION_INTERVAL);

router.get('/download-csv', async (ctx) => {
    const headers = [
        { id: 'time', title: 'TIME' }
    ];
    collectedData.forEach(data => {
        Object.keys(data).forEach(key => {
            if (!headers.find(header => header.id === key)) {
                headers.push({ id: key, title: key.toUpperCase() });
            }
        });
    });

    const csvWriter = createCsvWriter({
        path: 'output/data.csv',
        header: headers
    });

    await csvWriter.writeRecords(collectedData)
        .then(() => {
            console.log('The CSV file was written successfully');
        });

    ctx.set('Content-disposition', 'attachment; filename=data.csv');
    ctx.set('Content-type', 'text/csv');
    ctx.body = fs.createReadStream('output/data.csv');
});

if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

app.use(router.routes()).use(router.allowedMethods());

io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
