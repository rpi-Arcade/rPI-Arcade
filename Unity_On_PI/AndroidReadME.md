## Setting up Raspi 5:
<ol>
<li> Put the peower button on the case </li>
<li> While making sure power button does not fall out, insert raspi </li>
<li> Screw in RasPi into case </li>
<li> Apply thermal pads as shown <a href="https://github.com/Michonster/rPI-Arcade/blob/Unity_On_PI/Unity_On_PI/RasPi_ThermalPads.jpg">here</a></li>
<li> Insert pushpins on heat sink </li>
<li> Push pushpins into the RasPi </li>
</ol>

## Flashing RasPi 5 with Android:
<ol>
<li> Download Ras Pi Imager from there website <a href ="https://www.raspberrypi.com/software/">here</a></li>
<li> Select Raspi 5 for Pi Device </li>
<li> Go to <a href="https://konstakang.com/devices/rpi5/"> this website </a> and download the latest version of Android </li>
<li> In the Imager, Select the OS and scroll down to custom </li>
<li> Navigate to and select the OS you downloaded </li>
<li> Select the micro sd card to flash </li>
<li> Select Write then Confirm on the pop-up </li>
<li> Select Cancel if Windows asks to format the disk </li>
</ol>

## Resizeing Android Partition:
<ol>
<li> Go to <a href = "https://konstakang.com/devices/rpi5/"> this website</a> and select the version of android you downloaded</li>
<li> Scroll down to the FAQ and download the KonstaKANG-rpi-resize.zip </li>
<li> Move the downloaded file to an external USB then plug the USB into the Raspberry Pi</li>
<li> Go to the settings of the Pi, Under System -> Raspberry Pi Settings togle on reboot to recovery</li>
<li> Reboot the Raspberry Pi </li>
<li> On the recovery screen select "Install" </li>
<li> Tap on Select Storage and select the USB </li>
<li> Select the zip and slide to install </li>
<li> Reboot the Raspberry Pi into system </li>
</ol>

## Downloading Aptoide on Android Pi:
<ol>
<li> On a seperate device, go to <a href= "https://en.aptoide.com/" > this website</a> and click on the download button </li>
<li> After it finishes downloading, move the file onto a seperate USB stick </li>
<li> Insert the USB into the raspberry pi</li>
<li> Open the files app on the raspberry pi and navigate to the USB </li>
<li> Select the apk file and allow it to install </li>
</ol>

## Download Termux, Update Linux, and Install GIT on Android
<ol>
<li> Go to <a href= "https://f-droid.org/en/packages/com.termux/"> this website </a> and download the latest APK that is not in beta or alpha </li>
<li> After it finishes downloading, move the file onto a seperate USB stick </li>
<li> Insert the USB into the raspberry pi </li>
<li> Go to the files app and select the USB </li>
<li> Select the APK file and click download </li>
<li> Open Termux and run the following commands: </li>
    <ul>
    <li> apt-get update </li>
    <li> apt-get upgrade </li>
    <li> apt-get install git </li>
    </ul>
</ol>
When requested, type in Y to continue downloads 

## Making a Directory in Termux on Andoid
<ol>
<li> Run the command: apt update && apt upgrade </li>
<li> Run the command: termux-setup-storage </li>
<li> Run the command: cd /sdcard </li>
<li> Run the command: mkdir ~enter_name_here~ </li>
<li> Run the command: cd ~enter_name_here~ </li>
</ol>

## Installing Node on android
<ol>
<li> Run the command: pkg install nodejs </li>
<li> Run the command: pkg upgrade </li>
</ol>

## Conclusion For Android Version
After installing node and attempting to follow <a href = "https://github.com/Michonster/rPI-Arcade/tree/main/electron_app/frontend"> these steps, </a> we run into a issue.
<a href = "https://github.com/Michonster/rPI-Arcade/blob/Unity_On_PI/Unity_On_PI/AndroidError.PNG"> In this image </a> we see that electron is not supported on android.
Aditionally, in <a href = "https://github.com/electron/electron/issues/45485"> this git issue </a> we see that the developers are not planning to add support to android.
Due to the neccesity of electron, we can not install the project on android unless we emulate a seperate OS on android that runs electron or migrate away from electron.
Instead of continuing to attempt to get the program to run we instead are going to get BOX64 to run on a standard RASPI os

## BOX64
Utilized <a href = "https://github.com/ptitSeb/box64/blob/main/docs/COMPILE.md"> these </a> steps to install BOX64.

## Emulation Station
Utilized <a href = "https://retropie.org.uk/docs/Manual-Installation/"> these </a> steps to install emulation station.


## Google License Steps (unused) 
### Google Play on Raspi:
Note: Unless using another android system, you cannot get play certified. Instead install Aptoide for mobile apps
<ol>
<li> Turn on the Raspi</li>
<li> Enable developer settings by opening settings, going to about, and tapping the build number until enabled</li>
<li> Navigate to Raspberry Pi settings and enable reboot to recovery</li>
<li> On another device, go to<a href = "https://wiki.lineageos.org/gapps/">this website</a> and download the version of playstore for your version of Android onto a usb drive </li>
<li> Reboot RaspberryPi and insert usb</li>
<li> In the recovery menu select "install"</li>
<li> Scroll down and select downloads </li>
<li> Select the zip file, swipe to install </li>
<li> Reboot into system </li>
</ol>

### Play Certification:
Note: Unable to set/get a GSF ID using the android system downloaded
<ol>
<li> On a seperate device, go to <a href="https://github.com/K3V1991/Fix-This-Device-isnt-Play-Protect-certified"> this website</a> and follow the steps to certify the pi </li>'
</ol>

