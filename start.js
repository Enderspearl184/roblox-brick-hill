const nh = require('node-hill')

nh.startServer({
gameId: 25551, // Your game id here

port: 42482, // Your port id here (default is 42480)

local: true, // Whether or not your server is local

map: './maps/Home.brk',

scripts: './user_scripts', // Your .js files location

modules: ["http"] // npm modules to allow in sandbox

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})