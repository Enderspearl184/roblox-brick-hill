DIFFERENT BETTER VERSION THAT ACTUALLY TRIES TO EMULATE A NORMAL CLIENT SO IT CAN JOIN ALMOST ANY BRICK HILL GAME AT [HERE](https://github.com/Enderspearl184/roblox-brick-hill-socket)


How to get it running: 
# step 1: node-hill

Add the scripts in user_scripts to your user_scripts folder

in start.js add "modules: ['http']"

if you already have a modules array then add an extra entry that just says "http"

then, save

Customize the map if you want, and add scripts or whatever.

Just use Game.allPlayers to get ghost players included
and Game.fakePlayers to ONLY get ghost players
and Game.players is just real players

# step 1*a*: port stuff
Just like your math homework this isnt the end of step one

I'm assuming you know how to port forward so no instructions for that here

Forward *another* port different than the one you are hosting node-hill on

open loader.js and change the port on the top line to the port you just forwarded and remember to ***save***

# step TWO: roblox
the game is uncopylocked the link is https://www.roblox.com/games/5886668460/

open it, and edit the script named Loader in ServerScriptService

change \_G.port to the port you have in loader.js

change \_G.url to the url/ip of the http server (like http://example.com or http://127.0.0.1) but don't put a / at the end of it

\_G.differentServer is for if you are running studio on a different device than what you are hosting on

# thats basically it I probably missed stuff though lol

as an added bonus most scripts here update themselves so you don't need to keep editing them!
