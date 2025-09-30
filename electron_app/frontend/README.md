## Setting Up the Development Environment on Windows

#### Clone the Project
1. Clone this repository to your local machine.  
   ```
   git clone <repository-url>
   ```

#### Frontend setup (Powershell)
Because we are using Electron and WSL does not support GUI's (graphic interfaces), these are the steps to run it in Powershell. If you want to run it in WSL, if you have WSL2, download an X server to access the Windows display. 

2. **<ins>Important</ins>**: you'll need to download node and npm for powershell if you don't have it. Check using ```node --version``` and ```npm version```

2. To download all the frontend dependencies: 
from administrator powershell, navigate to rPi-Arcade/electron_app/frontend/  
then run ``` npm install ```

**Possible errors**: 
- PowerShell may display an error stating that the script is not digitally signed and cannot be run. (Note that distributed apps usually need to be signed for security reasons, but we're still in development.) To bypass this error message, you can use the following command:
```Set-ExecutionPolicy -ExecutionPolicy RemoteSigned```
This lets you run local scripts without being signed.

4. At this point, you should be able to run ```npm run dev``` and load the UI.


#### Backend setup

This is for being able to run the backend python scripts on your machine. I have not tested running them on powershell, and I recommend running them through Ubuntu because the setup is easier.

These steps are for Ubuntu/WSL terminal.

5. Verify you have python3 and pip installed. 
```python3 --version```
```pip --version```
If not, install both of them with:
```sudo apt install python3```
```sudo apt install python3-pip```

6. To download all necessary dependencies, navigate to backend/ and run: 
```pip install -r requirements.txt```

7. To run the scripts, navigate to rPi-Arcade/electron_app/ 
and to run both scripts at the same time:
```make start-backend```
Check the makefile for other options of starting them (individually, or both the backend and frontend --reminder that starting frontend doesn't work on WSL)
