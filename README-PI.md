Instructions on How To Run RPI Rcade on Raspberry Pi:
Open 3 Seperate Terminals
1. To run the flask server 
2. To run the controller monitor
3. To run the front end

In each terminal, run the following command to enter the virtual environment (where gunicorn and other dependencies are installed)
```source ~/myenv/bin/activate```

The Flask Server MUST be run before the Controller Monitor

1. Flask Server
```cd rPI-Arcade/electron_app/backend```
```python3 flask_socket_server.py```

2. Controller Monitor
```cd rPI-Arcade/electron_app/backend```
```python3 controller_monitor2.py```

3. Run frontend
```cd rPI-Arcade/electron_app/frontend```
```npm run dev```