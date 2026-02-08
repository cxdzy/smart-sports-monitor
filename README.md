# Smart Sports Monitor (Work in Progress)

This project uses React with Vite for the frontend dashboard.  
It is part of an IoT-based Smart Sports Monitor system and is still under development.

Some features, integrations, and documentation are not finalized yet.

---

## Objectives

* Monitor environmental conditions of outdoor sports fields in real time
* Detect unsafe thermal conditions using automated threshold logic
* Provide immediate safety status feedback
* Log sensor data to the cloud for analysis and validation
* Demonstrate a practical Smart Campus IoT safety solution

---

## System Architecture

The system consists of three main layers:

### 1. Hardware Layer (ESP32 Device)

* ESP32 microcontroller
* DHT11 temperature and humidity sensor
* DS18B20 waterproof ground temperature sensor
* GL55 LDR sunlight sensor
* 20x4 I2C LCD display
* Buzzer for unsafe condition alerts

The ESP32 collects sensor data and publishes JSON messages via MQTT.

### 2. Backend Layer

A Node.js MQTT server processes incoming sensor data:

Repository: [https://github.com/cxdzy/mqtt-server-js](https://github.com/cxdzy/mqtt-server-js)

Responsibilities:

* Subscribe to MQTT sensor topics
* Parse and store latest sensor data
* Forward data to ThingSpeak
* Provide API endpoints for real-time access

### 3. Cloud Analytics Layer

ThingSpeak is used for:

* Data logging
* Historical visualization
* Trend analysis
* System validation

---

## Features

* Real-time environmental monitoring
* Automated safety evaluation logic
* MQTT-based communication
* Cloud data logging with ThingSpeak
* Historical sensor visualization
* Local safety status display
* Audible alert for unsafe conditions
* Web dashboard integration

---

## Safety Logic

The system marks conditions as unsafe when any threshold is exceeded:

* Ground temperature greater than 55°C
* Air temperature greater than 35°C
* Sunlight intensity greater than 850

If any condition is unsafe, the system triggers alerts and updates the status accordingly.

---

## Installation and Setup

### Hardware Setup

1. Connect all sensors to the ESP32 according to the circuit design
2. Upload the ESP32 firmware using Arduino IDE
3. Configure WiFi credentials in the source code

### Backend Server

Clone and run the MQTT server:

```
git clone https://github.com/cxdzy/mqtt-server-js
cd mqtt-server-js
npm install
Run the development server:

bash
Copy code
npm run dev
Open your browser and access:

arduino
Copy code
http://localhost:5173