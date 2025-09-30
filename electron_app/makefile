start-controller-monitor:
	@echo "Starting controller monitor server..."
	cd backend && gunicorn -w 1 -k eventlet -b 0.0.0.0:5002 controller_monitor:app

start-usb-monitor:
	@echo "Starting USB monitor server..."
	cd backend && gunicorn -w 1 -k eventlet -b 0.0.0.0:5001 USB_monitor:app

start-backend: 
	make -j 2 start-controller-monitor start-usb-monitor

start-frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

start: start-controller-monitor start-usb-monitor start-frontend
