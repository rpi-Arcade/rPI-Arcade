#!/bin/bash

LOG = "/home/rpiarcade/debug_log.txt"

export DISPLAY=:0

echo "--- LAUNCH ATTEMPT $(date) ---" > $LOG
echo "Running as user: $(whoami)" >> $LOG
echo "User groups: $(groups)" >> $LOG
echo "Game Path: $1" >> $LOG

echo "Freeing Audio Device..." >> $LOG
pulseaudio -k >> $LOG 2>&1
killall pulseaudio >> $LOG 2>&1

#Launch Command
ls -l "$1" >> $LOG 2>&1
echo "Starting RetroArch..." >> $LOG

/opt/retropie/emulators/retroarch/bin/retroarch \
--verbose \
-L /opt/retropie/libretrocores/lr-snes9x/snes9x_libretro.so \
--config /opt/retropie.configs/snes/retroarch.cfg \
"$1" >> $LOG 2>&1

echo "--- EXIT CODE: $? ---" >> $LOG