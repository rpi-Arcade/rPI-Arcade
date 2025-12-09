#!/bin/bash
exec &> /home/rpiarcade/startup_log.txt
echo "--- Startup Script Started at $(date) ---"
sleep 30

#Backend scripts MUST be started in virtual environment to communicate with Gunicorn + dependencies

VENV_PYTHON="/home/rpiarcade/myenv/bin/python3"
echo "Navigating to backend..."
cd /home/rpiarcade/rPI-Arcade/electron_app/backend
echo "Starting Flask server..."
$VENV_PYTHON flask_socket_server.py &
sleep 10
echo "Starting controller monitor..."
$VENV_PYTHON controller_monitor2.py &
echo "Startup Done"