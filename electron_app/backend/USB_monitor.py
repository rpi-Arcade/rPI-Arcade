"""Script to copy roms via USB from any user when USB is inserted into 
the Raspberry Pi. Upon insertion, each game system file will be scanned
and the rooms within will be copied onto the RPI. In the case of duplicates,
the roms won't be installed. """
# import eventlet
# eventlet.monkey_patch()

# TO run the server: gunicorn -w 1 -k eventlet -b 0.0.0.0:5001 USB_monitor:app
import shutil
import os
import pyudev # type: ignore
import time
import subprocess
import zipfile
import signal
import sys
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

def signal_handler(signal, frame):
    print('Shutting down USB monitor server...')
    sys.exit(0)

# variables ==========================================================================

#Setup for USB monitoring 
context = pyudev.Context()
monitor = pyudev.Monitor.from_netlink(context)
monitor.filter_by(subsystem = 'block')

HOST = "127.0.0.1"  
PORT = 5001

# Setup socketio
app = Flask(__name__)
socketio = SocketIO(app)

CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

observer = None

# Variables/lists of games
success = 0
succ_list = []
duplicate = 0
dup_list = []
failed = 0
fail_list = []

MIN_SPACE = 1 * 1024 * 1024 * 1024  # 1 GB

game_systems = ['nes', 'n64', 'snes', 'dreamcast', 'psp', 'psx', 'nds', 'megadrive']

# server/client interaction ==========================================================================
@socketio.on('START')
def start_usb_monitoring():
    # clear any games from previous uploads in the same app instance 
    succ_list.clear()
    dup_list.clear()
    fail_list.clear()

    global observer
    observer = pyudev.MonitorObserver(monitor, callback=device_event, daemon=True)
    observer.start()
    print("Monitoring USB storage insertions...")
    # TESTING =====================================================
    # socketio.emit('status', {'message': 'Monitoring started'})
    # socketio.emit('status', {'message': 'USB device detected'})
    # socketio.emit('status', {'message': 'alksjdlkasjdl'})
    # socketio.emit('status', {'message': 'Please remove USB'})

@socketio.on('STOP')
def stop_usb_monitoring():
    global observer
    if observer is not None:
        print("Stopping USB monitoring...")
        observer.stop()  # Stop the observer first
        observer.join()  # Wait for the thread to finish
        observer = None  # Then set to None
        print("Stopped USB monitoring.")
        pass
    else:
        print("Observer not initialized.")
    socketio.emit('status', {'message': 'Monitoring stopped'})

@socketio.on('EXIT')
def exit_script():
    print("Exiting script")
    socketio.emit('status', {'message': 'Exiting script'})
    stop_usb_monitoring()
    exit(0)  # Exit the script
    
# ==========================================================================

#Extracts PSP, PS1, and Dreamcast games from zips/7z files
def extract_file(file_path, extract_to):
    #Zip extraction
    if file_path.endswith('.zip'):
        try:
            # Use '-o' to overwrite existing files, '-n' to skip extracting existing files
            subprocess.run(['unzip', '-n', file_path, '-d', extract_to], check=True)
            print(f"Successfully extracted {file_path} to {extract_to}")
            socketio.emit('status', {'message': f"Successfully extracted {file_path} to {extract_to}"})
        except subprocess.CalledProcessError as e:
            print(f"Error extracting {file_path}: {e}")
            socketio.emit('status', {'message': f"Error extracting {file_path}: {e}"})

    #7z extraction
    elif file_path.endswith('.7z'):
        try:
            subprocess.run(['7z', 'x', file_path, f'-o{extract_to}', '-aos'], check = True)
            print(f"Successfully extracted {file_path} to {extract_to}")
            socketio.emit('status', {'message': f"Successfully extracted {file_path} to {extract_to}"})
        except Exception as e:
            print(f"Error extracting {file_path}: {e}")
            socketio.emit('status', {'message': f"Error extracting {file_path}: {e}"})

#Copys games from USB folders onto raspberry pi
def copy_folder_from_usb(usb_base_path, destination_base_path):
    global success, succ_list, duplicate, dup_list, failed, fail_list
    complete_games=0 
    total_games = 0

    #Check how many games attempting to install
    for system in game_systems:
        usb_path = os.path.join(usb_base_path, system)
        if os.path.exists(usb_path):
            total_games += len(os.listdir(usb_path))
    print(f"Total number of games to be attempted for copy: {total_games}")
    socketio.emit('status', {'message': f"Total number of games to be attempted for copy: {total_games}"})
    
    #Repeat this process for each emulator
    for system in game_systems:
        usb_path = os.path.join(usb_base_path, system)
        final_destination_path = os.path.join(destination_base_path, system)
        final_destination_path = os.path.join(destination_base_path, system)
        # Ensure the USB path exists
        if os.path.exists(usb_path):
            try:
                # Copy the directory from USB to the destination
                for item in os.listdir(usb_path):
                    source_item = os.path.join(usb_path, item)
                    dest_item = os.path.join(final_destination_path, item)
                    disk_usage = shutil.disk_usage(destination_base_path)
                    free_space = disk_usage.free
                    required_space = os.path.getsize(source_item) if os.path.isfile(source_item) else 100 * 1024 * 1024  # Approximate 100MB for directories

                    #If no space for game, continue to next game
                    if free_space - required_space < MIN_SPACE:
                        print(f"Error: Not enough storage space to copy {item}. Required: {required_space / (1024**2):.2f} MB, Available: {free_space / (1024**2):.2f} MB")
                        socketio.emit('status', {'message': f"Error: Not enough storage space to copy {item}. Required: {required_space / (1024**2):.2f} MB, Available: {free_space / (1024**2):.2f} MB"})
                        failed += 1
                        fail_list.append(item)
                        complete_games+=1
                        print(f"{complete_games} / {total_games} Games Looked At")
                        continue

                    #If game is a duplicate, continue to next game
                    if os.path.exists(dest_item):
                        print(f"{item} already exists in {final_destination_path}")
                        socketio.emit('status', {'message': f"{item} already exists"})
                        duplicate += 1
                        dup_list.append(item)
                        complete_games+=1
                        print(f"{complete_games} / {total_games} Games Looked At")
                        continue

                    #Copy file or directory onto raspberry pi
                    try:
                        # In RetroPie folder, only copy folders that correspond to an emulator
                        if os.path.isdir(source_item) and os.path.basename(source_item) in game_systems:
                            shutil.copytree(source_item, dest_item, dirs_exist_ok=True)
                        elif os.path.isfile(source_item):
                            shutil.copy2(source_item, final_destination_path)
                            
                            #If game is PS1, PSP, DS, or Dreamcast, extract necessary zips/7z
                            if system in ['psx', 'dreamcast', 'psp', 'nds']:
                                if item.endswith('.zip') or item.endswith('.7z'):
                                    extract_file(dest_item, final_destination_path)
                        print(f"Successfully moved {system} game {item} to {final_destination_path}")
                        socketio.emit('status', {'message': f"Successfully added {system} game {item}"})
                        success += 1
                        succ_list.append(item)
                    except Exception as e:
                        print(f"Error moving {item} for {system}: {e}")
                        socketio.emit('status', {'message': f"Error moving {item} for {system}: {e}"})
                        failed += 1
                        fail_list.append(item)
                    complete_games+=1
                    print(f"{complete_games} / {total_games} Games Looked At")
                
                #Change ownership to rpiarcade
                chown_command = ['sudo', 'chown', '-R', 'rpiarcade:rpiarcade',final_destination_path] 
                subprocess.run(chown_command, check = True)

            except Exception as e:
                print(f"Error while copying {system}: {e}")
                socketio.emit('status', {'message': f"Error while copying {system}: {e}"})
        #Print that USB path doesnt exist if no path is found
        else:
            print(f"{system} not found on USB")


#Monitor USB insertion/removal
def device_event(device):
    #Perform when USB is inserted
    if device.action == 'add' and 'part' in device.device_type:
            print(f"USB device {device.device_node} inserted.")
            socketio.emit('status', {'message': f"USB device {device.device_node} inserted."})
            device_path = f'{device.device_node}'
            mount_point = '/mnt/usb'
            mount_command = ['sudo', 'mount', device_path, mount_point]
            unmount_command = ['sudo', 'umount', mount_point]
            try:
                #Mount the USB and run copy function
                subprocess.run(mount_command, check=True)
                print("Mount Success")
                socketio.emit('status', {'message': "Mount Success"})
                copy_folder_from_usb(os.path.join(mount_point,'RetroPie'),'/home/rpiarcade/RetroPie/roms' )

                #print list of games installed/not installed
                if success!=0:
                    print("\nSuccessfully Transfered Games:")
                    for game in succ_list:
                        base_game_name = game.split('(')[0].rsplit('.', 1)[0]
                        print(base_game_name)
                    socketio.emit("summary", {"type": "success", "games": succ_list})
                if duplicate!=0:
                    print("\nDid not Copy these Duplicates:")
                    for game in dup_list:
                        base_game_name = game.split('(')[0].rsplit('.', 1)[0]
                        print(base_game_name)
                    socketio.emit("summary", {"type": "duplicate", "games": dup_list})
                if failed!=0:
                    print("\nFailed to transfer these games:")
                    for game in fail_list:
                        base_game_name = game.split('(')[0].rsplit('.', 1)[0]
                        print(base_game_name)
                    socketio.emit("summary", {"type": "failed", "games": fail_list})
                
                #Unmount the USB
                subprocess.run(unmount_command, check=True)
                print("Unmount Successful, safe to remove USB")
                socketio.emit('status', {'message': "Please remove USB."})
                
            except subprocess.CalledProcessError as e:
                print(f"An error has occured: {e}")
                socketio.emit('status', {'message': "Please remove USB."})
   
    #When device is removed, stop script
    elif device.action == 'remove' and 'part' in device.device_type:
        print(f"USB partition {device.device_node} removed")
        socketio.emit('status', {'message': "USB successfully removed."})
        observer.stop()
        print("USB removed, stopping script")
        

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    socketio.run(app, host=HOST, port=PORT)


