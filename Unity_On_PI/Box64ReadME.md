## Installing BOX64 on RasPI
- On the RasPi, go to the [github](https://github.com/ptitSeb/box64/tree/main) and get the link to the project
- Open a terminal on the RasPi
- Clone the workspace by running ``` git clone [link you got]```
- Navigate into the workspace by running ``` cd box64```
- Run the following line ``` mkdir build; cd build; cmake .. -D RPI5ARM64=1 -D CMAKE_BUILD_TYPE=RelWithDebInfo ``` if you are using a RasPi 5
