const port=Game.rbxport; //change this to the second port you have forwarded.


const http=getModule("http");
const phin=getModule("phin");
const color=require("./../node_modules/node-hill/dist/util/color/colorModule.js").default;
const hex=require("./../node_modules/node-hill/dist/util/color/formatHex.js");
//const pickSpawn=require("./../node_modules/node-hill/dist/scripts/world/pickSpawn.js")
var chatMessages=[];
var ghostPlayerEdits=[];
var fakePlayer;
async function loadFakePlayer() {
	let fakescript = await phin("https://raw.githubusercontent.com/Enderspearl184/roblox-brick-hill/" + Game.branch + "/source/FakePlayers.js").body.toString()
	console.log(fakescript)
	fakePlayer=eval(fakescript).default
	console.log("loaded fake player class!")
}
loadFakePlayer()
Game.on("playerJoin", (p) => {
	p.on("chatted", (m) => {
		chatMessages.push({netId: p.netId, chat: `[${p.username}]: ${m}`})
		console.log(chatMessages)
	})
})

http.createServer(function (req, res) {
	if (req.url!=="/POSTplayerValues") return notfound(res);
	if (req.method!=="POST") return postrequest(res);
        let body = '';
       	req.on('data', chunk => {
      	   	body += chunk.toString();
      	});
	req.on('end', () => {
		let robloxjson = JSON.parse(body);
		if (Array.isArray(robloxjson.players) && Array.isArray(robloxjson.chat)) {
			handleFakePlayers(robloxjson);
			
			res.writeHead(200, {'Content-Type': 'application/json'});
			var playerinfo={
			players: [],
				chat: chatMessages,
				ghostPlayerEdits: ghostPlayerEdits,
				bricks: getBricks(),
				teams:getTeams()
			};
			chatMessages=[];
			ghostPlayerEdits=[];
			for (let players of Game.players) {
				if (players.roblox) continue
				let playervar={
					username: players.username,
					netId: players.netId,
					score: players.score,
					position: {x: players.position.x, y: players.position.z, z: players.position.y},
					rotation:players.rotation.z,
					colors: {
						head:players.colors.head,
						torso: players.colors.torso,
						leftLeg: players.colors.leftLeg,
						rightLeg: players.colors.rightLeg,
						leftArm: players.colors.leftArm,
						rightArm: players.colors.rightArm
					},
					team:undefined,
					health:{maxHealth: players.maxHealth, Health: players.health}
				};
				if (players.team) {
					playervar.team=players.team.netId
				}
				playerinfo.players.push(playervar);
			};
			res.end(JSON.stringify(playerinfo));
		} else {
			return badRequest(res)
		}
	})
}).listen(port);

function badRequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Not JSON or some other error? I TOLD YOU not to try to do stuff like this.')
} 

function notfound(res) {
	res.writeHead(404);
	res.end('404 Error. bruh dont try to break shit')
}

function postrequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Ya need to use a POST request here, but please dont you might break something.')
}

function getBricks() {
	let brickData=[]
	let env=world.environment
	world.bricks.forEach((brick) => {
		let brickobj={
			Color:brick.color,
			netId: brick.netId,
			rotation:brick.rotation,
			position:{x: brick.position.x+(brick.scale.x/2),y:brick.position.z+(brick.scale.z/2)+0.5,z:brick.position.y+(brick.scale.y/2)},
			scale:{x: brick.scale.x, y: brick.scale.z, z: brick.scale.y},
			Transparency: ((brick.visibility-0.5)*-1)+0.5,
			CanCollide: brick.collision
		}
		brickData.push(brickobj)
	})
	brickData.push({
		Color:env.baseColor,
		scale:{x:env.baseSize,y:0.05,z:env.baseSize},
		netId:"Baseplate",
		rotation:0,
		position:{x:0,y:0.4975,z:0},
		Transparency:0,
		CanCollide:true
	})
	return brickData
}

function handleFakePlayers(obj) {
	//remove gone players
	for (let p of Game.fakePlayers) {
		if (!obj.players.find((player) => player.netId==p.netId)) {
			removeFakePlayer(p)
		}
	}

	//add new players
	for (let p of obj.players) {
		let fakeplr=Game.fakePlayers.find((plr) => plr.netId==p.netId)
		if (!fakeplr) {
			let newpacket = new PacketBuilder("SendPlayers")
			.write("uint8", 1)
			//.write("uint32", p.netId)
			.write("uint32", p.netId)
			.write("string", p.username)
			.write("uint32", 0)
			.write("uint8", 0)
			.write("uint8", 2)
			newpacket.broadcast()
			let fakeplayer=new fakePlayer()
			if (Game.world.teams.length!==0) {
				fakeplayer.setTeam(Game.world.teams[Math.floor(Math.random() * Game.world.teams.length)]);
			}
			Game.fakePlayers.push(fakeplayer)
			Game.allPlayers.push(fakeplayer)
			fakeplayer.setPosition(pickSpawn())
		} else {
			if (!(p.alive===false)) {
				let fake=Game.fakePlayers.find((plr) => plr.netId==p.netId)
				if (p.position)
					setFakePlayerPosition(p.netId, {x:p.position.x,y:p.position.y,z:p.position.z,r:p.rotation})
				//if (p.rotation)
				//	setFakePlayerRotation(p.netId, p.rotation)
				if (p.colors)
					setFakePlayerColors(p.netId, p.colors)
				if (Game.fakePlayers.find((plr) => plr.netId==p.netId).alive==false) {
					teleFakePlayer(fake)
					fake.alive=true
				}
				setFakePlayerHealth(p.netId, false)
			} else {
				Game.fakePlayers.find((plr) => plr.netId==p.netId).alive=false
				setFakePlayerHealth(p.netId, true)
			}
		}
	}
	//handle chat
	obj.chat.forEach((msg) => {
		Game.messageRealPlayers("[#ffde0a][ROBLOX] " + msg.username + "\\c1:\\c0 " + msg.message);
		let fake = Game.fakePlayers.find((fake) => fake.username==msg.username)
		if (fake) {
			clearTimeout(fake.bubbleTimer);
			fake.setSpeech(msg.message);
			fake.bubbleTimer=setTimeout(() => {
				fake.setSpeech("")
			}, 6000)
		}
	})
}

function getTeams() {
	let teams=[]
	for (let t of Game.world.teams) {
		teams.push({name:t.name, color:t.color, netId:t.netId, playerNames: {}})
	}
	return teams
}

function getPlayerEdit(p) {
	let playerEdit=ghostPlayerEdits.find((edit)=>edit.username==p.username);	
	if (!playerEdit) {
		playerEdit={username:p.username,edits:{}}
		ghostPlayerEdits.push(playerEdit)
	}
	return playerEdit
}

function removeFakePlayer(p) {
	Game.fakePlayers.splice(Game.fakePlayers.indexOf(p), 1);
	Game.allPlayers.splice(Game.allPlayers.indexOf(p), 1);
	let removepacket = new PacketBuilder("RemovePlayer")
	.write("uint32", p.netId)
	removepacket.broadcast();
	p.destroyed=true
}

function sendFakePlayers(p) {
	let newpacket = new PacketBuilder("SendPlayers")
	.write("uint8", 1)
	.write("uint32", p.netId)
	.write("string", p.username)
	.write("uint32", 0)
	.write("uint8", 0)
	.write("uint8", 2)
	newpacket.broadcast()
}

function setFakePlayerPosition(netid, pos) {
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	if (pos.r<0) pos.r+=360
	let str=""
	if (pos.x!==fakeplayer.position.x)
		str+="A"
	if (pos.y!==fakeplayer.position.y)
		str+="B"
	if (pos.z!==fakeplayer.position.z)
		str+="C"
	if (pos.r!==fakeplayer.rotation.z)
		str+="F"
	if (str=="") return
	let pospacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", str)
		for (let i=0; i< str.length; i++) {
			let char=str.charAt(i)
			switch (char) {
				case "A": {
					pospacket.write("float", pos.x);
					break;
				}	
				case "B": {
					pospacket.write("float", pos.y);
					break;
				}
				case "C": {
					pospacket.write("float", pos.z);
					break;
				}
				case "F": {
					pospacket.write("float", pos.r);
					break;
				}
			}
		}
		//.write("float", pos.x)
		//.write("float", pos.y)
		//.write("float", pos.z)
	pospacket.broadcast()
	fakeplayer.position.x=pos.x;
	fakeplayer.position.y=pos.y;
	fakeplayer.position.z=pos.z;
	fakeplayer.rotation.z=pos.r;
}

function setFakePlayerHealth(netid, dead) {
	let hppacket = new PacketBuilder("Kill")
		.write("float", netid)
		.write("bool", dead)
	hppacket.broadcast()
}

function teleFakePlayer(p) {
	let spawn=pickSpawn()
	p.setPosition(spawn)
}

function setFakePlayerRotation(netid, rot) {
	if (rot<0) rot=rot+360
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.rotation.z=rot
	let rotpacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "F")
		.write("float", rot)
	rotpacket.broadcast()
}

function setFakePlayerColors(netid, colors) {
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.colors=colors
	let colorpacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "KLMNOPQUVW")
		.write("uint32", color.hexToDec(colors.head))
		.write("uint32", color.hexToDec(colors.torso))
		.write("uint32", color.hexToDec(colors.leftArm))
		.write("uint32", color.hexToDec(colors.rightArm))
		.write("uint32", color.hexToDec(colors.leftLeg))
		.write("uint32", color.hexToDec(colors.rightLeg))
		.write("uint32", 0)
		.write("uint32", 0)
		.write("uint32", 0)
		.write("uint32", 0)
	colorpacket.broadcast()
}

Game.messageAll=function(message,filtered) { //filtered isnt being used rn ill add it later
	Game.allPlayers.forEach((p)=>{
		p.message(message,filtered)
	})
    
}

Game.messageRealPlayers=function(message) {
	Game.players.forEach((p)=>{
		p.message(message)
	})
    
}

Game.messageFakePlayers=function(message,filtered) {
	Game.fakePlayers.forEach((p)=>{
		p.message(message,filtered)
	})
    
}

Game.on("playerJoin", (p) => {
	Game.allPlayers.push(p)
	Game.messageFakePlayers(`\\c6[SERVER]: \\c0${p.username} has joined the server!`)
	p.on("initialSpawn", () => {
		let newpacket = new PacketBuilder("SendPlayers")
		.write("uint8", Game.fakePlayers.length)
		for (let fake of Game.fakePlayers) {
			newpacket.write("uint32", fake.netId)
			newpacket.write("string", fake.username)
			newpacket.write("uint32", 0)
			newpacket.write("uint8", 0)
			newpacket.write("uint8", 2)
		}
		newpacket.send(p.socket)
		for (let fake of Game.fakePlayers) {
			if (fake.team) {
				let teampacket=new PacketBuilder("Figure")
					.write("uint32", fake.netId)
					.write("string", "Y")
					.write("uint32", fake.team.netId)
				teampacket.send(p.socket)
			}
		}
	})
})
Game.on("playerLeave", (p) => {
	Game.allPlayers.splice(Game.allPlayers.indexOf(p),1)
	Game.messageFakePlayers(`\\c6[SERVER]: \\c0${p.username} has left the server!`)
})

function pickSpawn() {
    const SPAWN_LENGTH = Game.world.spawns.length;
    if (SPAWN_LENGTH > 0) {
        const SPAWN_BRICK = Game.world.spawns[Math.floor(Math.random() * SPAWN_LENGTH)];
        return new Vector3(SPAWN_BRICK.position.x + SPAWN_BRICK.scale.x / 2, SPAWN_BRICK.position.y + SPAWN_BRICK.scale.y / 2, SPAWN_BRICK.position.z + SPAWN_BRICK.scale.z / 2);
    }
    const BASE_SIZE = Game.world.environment.baseSize;
    return new Vector3(generateRandomInteger(-BASE_SIZE / 2, BASE_SIZE / 2), generateRandomInteger(-BASE_SIZE / 2, BASE_SIZE / 2), BASE_SIZE / 2);
}

function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

Game.fakePlayers=[]
Game.allPlayers=[]

/*
  	if (req.url=="/GETplayerValues") {
		if (req.method!=='GET') return getrequest(res)
		res.writeHead(200, {'Content-Type': 'application/json'});
		var playerinfo={
			players: [],
			chat: chatMessages
		};
		chatMessages=[];
		for (let players of Game.players) {
			let playervar={
				username: players.username,
				netId: players.netId,
				position: {x: players.position.x, y: players.position.z, z: players.position.y},
				rotation:players.rotation.z,
				colors: {
					head:players.colors.head,
					torso: players.colors.torso,
					leftLeg: players.colors.leftLeg,
					rightLeg: players.colors.rightLeg,
					leftArm: players.colors.leftArm,
					rightArm: players.colors.rightArm
				},
				health:{maxHealth: players.maxHealth, Health: players.health}
			};
			playerinfo.players.push(playervar);
		};
		res.end(JSON.stringify(playerinfo));
*/
