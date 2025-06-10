// 定义 DOM 元素引用
const downloadBtn = document.getElementById('downloadBtn');
const chartsContainer = document.getElementById('charts-container');

// 图表通用配置
const chartOptions = {
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'minute'
            },
            title: {
                display: true,
                text: 'Time'
            }
        },
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Methane Concentration (ppm)'
            }
        }
    },
    responsive: true,
    maintainAspectRatio: false
};

// 使用明确定义的 localhost 地址连接 Socket.IO
const socket = io('http://localhost:3000');

// 存储每个设备的图表实例和div
let deviceCharts = {};

socket.on('data', (packet) => {
    const deviceId = packet.deviceId;
    const methane = parseFloat(packet.data.methane);
    const time = new Date();

    if (!deviceCharts[deviceId]) {
        const deviceDiv = document.createElement('div');
        deviceDiv.id = `device-${deviceId}`;
        deviceDiv.style.width = '50%';
        deviceDiv.style.height = '50vh';
        chartsContainer.appendChild(deviceDiv);

        const canvas = document.createElement('canvas');
        canvas.id = `chart-${deviceId}`;
        deviceDiv.appendChild(canvas);

        deviceCharts[deviceId] = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: `Methane Concentration - ${deviceId}`,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    data: []
                }]
            },
            options: chartOptions
        });
    }

    // 更新数据并重新绘制图表
    updateData(deviceCharts[deviceId], time, methane);
});

function updateData(chart, time, methane) {
    chart.data.labels.push(time.toISOString());
    chart.data.datasets[0].data.push(methane); // Methane dataset
    chart.update();
}

// 下载数据的功能实现
downloadBtn.addEventListener('click', () => {
    fetch('http://localhost:3000/download-csv') // 使用明确的 localhost 地址
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error('Failed to download file');
            }
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(error => {
            console.error('Error during file download:', error);
            alert('Error downloading the file. Please try again later.');
        });
});
