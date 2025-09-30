import eventlet
eventlet.monkey_patch()

# TO run the server: gunicorn -w 1 -k eventlet --timeout 120 -b 0.0.0.0:5002 controller_monitor:app
import pygame # type: ignore
import signal
import sys
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time

def signal_handler(signal, frame):
    print('Shutting down control montitor server...')
    sys.exit(0)

HOST = "127.0.0.1" 
PORT = 5002

# Setup socketio
app = Flask(__name__)
#socketio = SocketIO(app)

CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")#, logger=True, engineio_logger=True)

@socketio.on('START')
def start_controller_monitoring():
    thread = threading.Thread(target=start_joystick_handling, daemon=True)
    thread.start()
    print("Monitoring controller movements...")
    
    # TESTING =====================================================
    # socketio.emit("joystick_event", {"button": "Select", "action": "pressed"})
    # socketio.emit("joystick_event", {"button": "Select", "action": "released"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"direction": "left"})
    # time.sleep(0.5)  
    # socketio.emit("joystick_event", {"direction": "release"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"button": "X", "action": "pressed"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"button": "X", "action": "pressed"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"direction": "right"})
    # time.sleep(0.5)  
    # socketio.emit("joystick_event", {"direction": "release"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"direction": "right"})
    # time.sleep(0.5)  
    # socketio.emit("joystick_event", {"direction": "release"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"button": "X", "action": "pressed"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"button": "X", "action": "pressed"})
    # time.sleep(1)
    # socketio.emit("joystick_event", {"direction": "right"})
    # time.sleep(3)  
    # socketio.emit("joystick_event", {"direction": "release"})


# Start joystick monitoring in a separate thread
def start_joystick_handling():
    pygame.init()
    pygame.joystick.init()

    if pygame.joystick.get_count() == 0:
        print("No joystick detected. Please connect your arcade controller.")
        socketio.emit("error", {"message": "No joystick detected."})
        return  # Don't exit the program

    joystick = pygame.joystick.Joystick(0)
    joystick.init()

    print(f"Joystick detected: {joystick.get_name()}")
    print(f"Number of axes: {joystick.get_numaxes()}")
    print(f"Number of buttons: {joystick.get_numbuttons()}")

    try:
        while True:
            for event in pygame.event.get():
                #button press
                if event.type == pygame.JOYBUTTONDOWN:
                    button = map_button(event.button)
                    print(f"{button} Button pressed")
                    socketio.emit("joystick_event", {"button": button, "action": "pressed"})
                #button release
                elif event.type == pygame.JOYBUTTONUP:
                    button = map_button(event.button)
                    print(f"{button} Button released")
                    socketio.emit("joystick_event", {"button": button, "action": "release"})
                #joystick movement
                elif event.type == pygame.JOYAXISMOTION:
                    handle_axis_motion(event.axis, event.value)

                elif event.type == pygame.QUIT:
                    print("Exiting...")
                    return

    except KeyboardInterrupt:
        print("Exiting...")

    finally:
        pygame.quit()

# ====================================================

DEAD_ZONE = 0.2  # Define a dead zone for joystick axes

#variables to track joystick holding
is_holding_right = False
is_holding_left = False
is_holding_up = False
is_holding_down = False

#maps button numbers to correct symbol
def map_button(event_button):
    button_map = {
        4: 'Y', 5: 'X', 2: 'LT', 3: 'RT',
        1: 'B', 7: 'A', 6: 'LB', 0: 'RB',
        8: 'Select', 9: 'Start'
    }
    return button_map.get(event_button, f"Unknown ({event_button})")

#checks position of the joystick
def handle_axis_motion(axis, value):
    global is_holding_right, is_holding_left, is_holding_up, is_holding_down
    if axis == 0:  # X-axis
        # Right direction
        if value > 0.5:
            if not is_holding_right: 
                print("Joystick held right")
                socketio.emit("joystick_event", {"direction": "right"})
                is_holding_right = True
            is_holding_left = False  

        # Left direction
        elif value < -0.5:
            if not is_holding_left:  
                print("Joystick held left")
                socketio.emit("joystick_event", {"direction": "left"})
                is_holding_left = True
            is_holding_right = False  

        # Neutral position (release)
        elif abs(value) < DEAD_ZONE:
            if is_holding_right or is_holding_left:
                print("Joystick released")
                socketio.emit("joystick_event", {"direction": "release"})
            is_holding_right = False
            is_holding_left = False
    if axis == 1:  # Y-axis
        # Down direction
        if value > 0.5:
            if not is_holding_down:  
                print("Joystick held down")
                socketio.emit("joystick_event", {"direction": "down"})
                is_holding_down = True
            is_holding_up = False  

        # Up direction
        elif value < -0.5:
            if not is_holding_up:  
                print("Joystick held up")
                socketio.emit("joystick_event", {"direction": "up"})
                is_holding_up = True
            is_holding_down = False  

        # Neutral position (release)
        elif abs(value) < DEAD_ZONE:
            if is_holding_up or is_holding_down:
                socketio.emit("joystick_event", {"direction": "release"})
                print("Joystick released")
            is_holding_up = False
            is_holding_down = False

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    socketio.run(app, host=HOST, port=PORT, allow_unsafe_werkzeug=True)
