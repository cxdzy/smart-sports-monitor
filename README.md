# Smart Outdoor Sports Monitor

## Overview

Smart Outdoor Sports Monitor is an IoT-based safety monitoring system designed to protect athletes from heat-related risks in outdoor sports environments. The system continuously measures air temperature, ground surface temperature, humidity, and sunlight intensity, then evaluates field safety conditions in real time.

Sensor data is transmitted via MQTT to a Node.js backend server and logged to ThingSpeak for cloud analytics and historical monitoring. The system provides instant visual feedback through an local display and supports remote monitoring through web-based dashboards.

This project was successfully demonstrated in a live exhibition setting, showcasing stable real-time data transmission, cloud integration, and intelligent safety evaluation.

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
npm start
```

### ThingSpeak Configuration

1. Create a ThingSpeak channel
2. Configure API keys in the server environment
3. Map sensor fields correctly

---

## Demonstration Results

During exhibition testing:

* Continuous real-time data transmission was achieved
* ThingSpeak successfully logged long-term sensor data
* Safety logic responded accurately to environmental changes
* The system operated reliably under live demonstration conditions

---

## Technologies Used

* ESP32 microcontroller
* Arduino framework
* Node.js
* MQTT protocol
* Express.js
* ThingSpeak cloud platform
* JavaScript
* Embedded C/C++

---

## Future Improvements

* Mobile application integration
* Advanced predictive heat analysis
* Automated notification system
* Expanded sensor network coverage
* Machine learning-based safety prediction

---

## Author

Developed by Haziq Naqib as part of an Smart IoT campus safety project.

---

## License

This project is for academic and educational purposes.
