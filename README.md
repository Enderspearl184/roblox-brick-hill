# roblox-hill
The roblox game allows connecting to the node-hill server and vice versa

It's nowhere near complete or anything and is pretty buggy but here it is if you want the spaghetti code for some reason

I probably won't expand on this further so do it yourself if you want to

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

Forward *another* port different than the one you are hosting on

open FakePlayers.js and change the port on the top line to the port you just forwarded and remember to ***save***

# step TWO: roblox
the game is https://www.roblox.com/games/5886668460/

its uncopylocked so you can copy it and stuff

open it, and edit RobloxScript in ServerScriptService

change \_G.port to the port the http server is being hosted on.

change \_G.url to the url/ip of the http server

\_G.differentServer probably doesn't need to be changed but its there

# step 2a: if you edited the map do this otherwise there is no need
The map doesnt get updated to roblox so use smartlion's brk converter (https://scratch.mit.edu/projects/370355259/editor/), load the place it gives you and copy everything to the place with the scripts.

# thats basically it I probably missed stuff though lol
