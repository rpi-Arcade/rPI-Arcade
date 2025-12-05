# flask_socket_server.py
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import subprocess

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend requests

socketio = SocketIO(app, cors_allowed_origins="*")

# Environment Configuration:
# Check if Pi specific path exists
PI_ROM_PATH = '/home/rpiarcade/RetroPie/roms'

EMULATOR_CORES = {
    'snes': '/opt/retropie/libretrocores/lr-snes9x/snes9x_libretro.so',
    'nes': '/opt/retropie/libretrocores/lr-mesen/mesen_libretro.so',
    'n64': '/opt/retropie/libretrocores/lr-mupen64plus-next/mupen64plus_next_libretro.so',
    'nds': '/opt/retropie/libretrocores/lr-desmume/desmume_libretro.so',
    'psx': '/opt/retropie/libretrocores/lr-pcsx-rearmed/pcsx_rearmed_libretro.so',
    'psp': '/opt/retropie/libretrocores/lr-ppsspp/ppsspp_libretro.so',
    'genesis': '/opt/retropie/libretrocores/lr-genesis-plus-gx/genesis_plus_gx_libretro.so' 
}

if os.path.exists(PI_ROM_PATH):
    print("--- PRODUCTION MODE DETECTED (Raspberry Pi) ---")
    IS_RASPBERRY_PI = True
    ROMS_BASE_PATH = PI_ROM_PATH
else:
    print("--- DEVELOPMENT MODE DETECTED (PC/WSL) ---")
    IS_RASPBERRY_PI = False
    ROMS_BASE_PATH = os.path.join(os.getcwd(), 'test_files')

RPIARCADE_USER = 'rpiarcade'

# When a joystick event is received from any client (controller_monitor2 or frontend)
@socketio.on("joystick_event")
def handle_joystick_event(data):
    print(f"Received joystick event from client: {data}")
    # Broadcast to all connected frontend clients
    emit("joystick_event", data, broadcast=True)

@socketio.on("get_games_list")
def get_games_list_handler(data):
    # Expects {'emulator': 'nes'}
    emulator_name = data.get('emulator')
    games_list = []

    if not emulator_name:
        print("Error: Missing emulator name in request.")
        return []
    
    emu_path = os.path.join(ROMS_BASE_PATH, emulator_name)

    print(f"Scanning directory: {emu_path}")

    if os.path.isdir(emu_path):
        # Scan the directory and filter out non-game files (like XML, images, etc.)
        # This is a basic filter; you might need to adjust accepted extensions. !!!!!!!!
        
        # A list of common game file extensions (adjust as needed for your setup)
        game_extensions = ['.nes', '.sfc', '.zip', '.iso', '.bin', '.cue', '.7z', '.m64', '.z64', '.txt']

        for item in os.listdir(emu_path):
            if os.path.isfile(os.path.join(emu_path, item)) and any(item.lower().endswith(ext) for ext in game_extensions):
                games_list.append(item)

        games_list.sort()
    else:
        print(f"Directory not found: {emu_path}")

    print(f"Games found for {emulator_name}: {len(games_list)}")
    emit("games_list_response", {"emulator": emulator_name, "games": games_list})

@socketio.on("launch_game")
def launch_game_handler(data):
    emulator_name = data.get('emulator')
    game_file = data.get('game_file')
    
    if not emulator_name or not game_file:
        return

    # --- DEV MODE ---
    if not IS_RASPBERRY_PI:
        emit("launch_game_response", {"status": "success", "game": game_file})
        return  

    # --- PROD MODE ---
    game_path = os.path.join(ROMS_BASE_PATH, emulator_name, game_file)
    core_path = EMULATOR_CORES.get(emulator_name)

    if not core_path:
        error_msg = f"Error: Core not defined for '{emulator_name}' in Python."
        print(error_msg)
        emit("launch_game_response", {"status": "error", "error": error_msg})
        return
    
    config_path = f"/opt/retropie/configs/{emulator_name}/retroarch.cfg"

    # We call our new wrapper script using sudo -u rpiarcade
    # openvt -w waits for the game to finish before releasing the screen
    full_command = ['sudo', '-u', 'rpiarcade', '/home/rpiarcade/debug_launcher.sh', core_path, config_path, game_path]
    
    print(f"Calling Wrapper: {' '.join(full_command)}")

    try:
        subprocess.Popen(
            full_command,
            stdout=None, 
            stderr=None,
            preexec_fn=os.setpgrp
        )
        emit("launch_game_response", {"status": "success", "game": game_file})

    except Exception as e:
        print(f"Launch failed: {e}")

if __name__ == "__main__":
    print("Starting Flask-SocketIO server...")
    print(f"Looking for ROMs in: {ROMS_BASE_PATH}")
    socketio.run(app, host="0.0.0.0", port=5002)
