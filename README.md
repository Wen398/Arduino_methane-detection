# Methane Monitoring System

This is a methane concentration monitoring system using an **ESP8266 + MQ-4 sensor**. Data is transmitted in real-time to a Node.js backend and displayed on a web page. It can also be run directly using a desktop application (packaged with Electron).

---

## ESP8266 Setup

Please modify the following code to connect the ESP8266 to your Wi-Fi and send sensor data to the server:

```cpp
const char* ssid = “your WiFi name”;
const char* password = “your WiFi password”;
const char* serverName = “http://Your computer IP:3000/update-data”;

---

## Usage

### Method 1: Directly Run the Desktop Application

1. Go to `Releases` to download the packaged `.exe` file (the icon is an atom icon)
2. Run the `.exe` file, which will automatically start the server and open the frontend webpage
3. All received data will be displayed on the frontend and stored in `output/data.csv`

> If a firewall warning appears, click “Allow access” to ensure the server functions properly

---

### Method 2: Developer mode (manual execution)

#### Prerequisites

* Node.js (recommended v16 or higher)
* Install dependencies:

```bash
npm install
```

#### Run server + frontend

```bash
node server.js
```

Open your browser and go to: [http://127.0.0.1:3000](http://127.0.0.1:3000) to view the webpage

#### Run the Electron desktop version (developer mode)

```bash
npm start
```

---

## Data Download (CSV)

* Data is collected every 8 seconds
* All CSV files are stored in `output/data.csv`

---

## Technical Architecture

* ESP8266 + MQ-4 Sensor (data transmitted via Wi-Fi)
* Node.js + Koa + Socket.IO Backend
* HTML/JavaScript Frontend Real-time Charts
* Electron packaged as a desktop application

---

## Author

Created by \[Wen].
Feel free to submit issues or pull requests to improve this project.

---

## Notes

* If using multiple devices, you can distinguish the sensor source using the `deviceId` field.

Translated with DeepL.com (free version)
