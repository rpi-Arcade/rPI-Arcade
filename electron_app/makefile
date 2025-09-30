start-flask-server:
	@echo "Starting flask socket server..."
	cd backend && python3 flask_socket_server.py

start-controller-monitor:
	@echo "Starting controller monitor server..."
	cd backend && python3 controller_monitor2.py

start-usb-monitor:
	@echo "Starting USB monitor server..."
	cd backend && gunicorn -w 1 -k eventlet -b 0.0.0.0:5001 USB_monitor:app

#give time for flask server to start
start-backend: 
	@echo "Starting backend..."
	make start-flask-server &
	sleep 10
	make start-controller-monitor

start-frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

start-no-usb: 
	make start-backend &
	sleep 7
	make start-frontend

start: start-backend start-usb-monitor start-frontend
