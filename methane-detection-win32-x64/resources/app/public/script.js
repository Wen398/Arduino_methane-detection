// Defining DOM element references
const downloadBtn = document.getElementById('downloadBtn');
const chartsContainer = document.getElementById('charts-container');

// Chart General Configuration
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

const socket = io('http://localhost:3000');

// Stores chart instances and divs for each device
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

    // Update data and redraw the chart
    updateData(deviceCharts[deviceId], time, methane);
});

function updateData(chart, time, methane) {
    chart.data.labels.push(time.toISOString());
    chart.data.datasets[0].data.push(methane); // Methane dataset
    chart.update();
}

// Download data function implementation
downloadBtn.addEventListener('click', () => {
    fetch('http://localhost:3000/download-csv')
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
