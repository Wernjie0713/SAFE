# SAFE: Smart AI Factory Safety System

**SAFE** is an advanced, AI-driven platform designed to enhance workplace safety and environmental protection in industrial facilities. It provides a proactive and intelligent system for early gas leak detection, comprehensive risk forecasting, and effective incident prevention, moving beyond traditional reactive safety measures.

This project was developed for the **Hack Attack 2.0 Hackathon**, targeting the "AI-Driven Environmental Monitoring" case study. Our mission is to leverage AI to create a safer, more sustainable industrial environment in Malaysia and beyond.

![Main Dashboard](https://i.imgur.com/your-dashboard-image-link.png) 
*(Note: You can replace this with a link to one of your Figma images after uploading it to an image hosting service like Imgur)*

---

## 🚩 The Problem

Industrial facilities in sectors like manufacturing and chemical processing face significant risks from hazardous gas leaks. These incidents pose severe threats:

* **Human Safety:** Gas exposure can lead to severe injuries, long-term health issues, and fatalities. [cite_start]In 2023, the manufacturing sector in Malaysia alone recorded **10,335 occupational injuries and 66 deaths**[cite: 5, 371].
* [cite_start]**Environmental Impact:** Uncontrolled gas releases pollute the environment, with some facilities emitting hundreds of tons of Volatile Organic Compounds (VOCs) annually[cite: 373].
* [cite_start]**Economic Losses:** Accidents lead to production downtime, equipment damage, and significant financial repercussions, costing an estimated **4% of global GDP** according to the ILO[cite: 97].
* **Operational Inefficiency:** Traditional safety systems are often reactive, triggering alarms only after a critical threshold is met, and sensor malfunctions can create dangerous monitoring blind spots.

SAFE addresses these challenges by providing an intelligent, proactive, and integrated safety management solution.

---

## ✨ Core Features

Our system provides a centralized platform for comprehensive safety monitoring through several key features:

* **Centralized AI-Powered Dashboard:** A real-time command center for safety managers, visualizing live data, alerts, and AI-driven insights. Key components include a Live Alert Feed, Quick Stats, an interactive Factory Map View, and trend charts.
* **Predictive Analytics & Forecasting:** Utilizes time-series analysis and anomaly detection to forecast potential gas leak escalations and identify subtle deviations from normal operating parameters, enabling preemptive action.
* **Robotic Visual Analysis:** Integrates with camera-equipped robots to provide visual inspection of hazardous or inaccessible areas. Our cloud-based computer vision AI analyzes these video feeds to detect visual hazards like smoke, spills, equipment damage, or unsafe practices.
* **Sensor Health Monitoring:** Proactively monitors the connectivity and operational status of all sensors in the network to prevent safety blind spots and schedule predictive maintenance.
* **Historical Reporting & Analytics:** A comprehensive reporting module that allows users to access, filter, and export historical data on all alerts and incidents for compliance, auditing, and trend analysis.
* **AI Assistant:** A conversational AI chatbot that allows users to query system status and safety information using natural language.
* **Flexible Data Integration:** Designed to connect with existing factory systems (SCADA, PLCs) via industrial protocols (OPC UA, MQTT) while providing a clear upgrade path for legacy sensors through partnerships.
* **Data Sovereignty:** Ensures factories retain full control and ownership of their sensitive operational data by hosting the database on their private infrastructure.

---

## 🏗️ System Architecture

Our system is built on a modern, scalable cloud architecture hosted on Google Cloud Platform. It separates concerns between the frontend, backend, database, and AI models to ensure robustness and maintainability.

*(You can insert your System Architecture Diagram image here)*

1.  **Data Sources:** Real-time data is ingested from factory sensors and video feeds from robotic cameras.
2.  **Data Ingestion API:** A secure entry point that receives all incoming data.
3.  **Backend (Laravel):** The core engine that processes data, runs business logic, communicates with the database and AI models, and triggers alerts.
4.  **AI Platform (Google Vertex AI):** Houses specialized AI models for sensor data forecasting and computer vision analysis.
5.  **Database (Supabase):** Securely stores all sensor data, alert logs, and system configurations.
6.  **Frontend (React):** A responsive web dashboard that provides the user interface for safety managers.

---

## 🛠️ Technology Stack

* **Frontend:** React, Tailwind CSS
* **Backend:** Laravel (PHP)
* **Database:** Supabase (PostgreSQL)
* **AI / Machine Learning:** Google Vertex AI, TensorFlow/PyTorch, OpenCV
* **Cloud & Deployment:** Google Cloud Platform (GCP)
* **Prototyping:** Figma

---

## 🚀 Getting Started

Follow these instructions to set up a local development environment for the SAFE system.

### Prerequisites

* PHP >= 8.1
* Composer
* Node.js & npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/safe-factory-system.git](https://github.com/your-username/safe-factory-system.git)
    cd safe-factory-system
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your environment file:**
    * Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    * Generate an application key:
        ```bash
        php artisan key:generate
        ```

5.  **Configure your `.env` file:**
    * Update the `DB_*` variables with your Supabase project credentials. Make sure to set `DB_CONNECTION=pgsql`.

6.  **Run database migrations:**
    * This will create the necessary tables in your Supabase database.
        ```bash
        php artisan migrate
        ```

7.  **Run the development servers:**
    * In one terminal, compile frontend assets and watch for changes:
        ```bash
        npm run dev
        ```
    * In a second terminal, start the Laravel server:
        ```bash
        php artisan serve
        ```

Your application should now be running at `http://127.0.0.1:8000`.

---