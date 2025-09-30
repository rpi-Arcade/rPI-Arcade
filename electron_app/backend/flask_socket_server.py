# flask_socket_server.py
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend requests

# Create the socketio instance
socketio = SocketIO(app, cors_allowed_origins="*")

# When a joystick event is received from any client (controller_monitor2 or frontend)
@socketio.on("joystick_event")
def handle_joystick_event(data):
    print(f"Received joystick event from client: {data}")
    # Broadcast to all connected frontend clients
    emit("joystick_event", data, broadcast=True)

if __name__ == "__main__":
    print("Starting Flask-SocketIO server...")
    socketio.run(app, host="0.0.0.0", port=5002)
