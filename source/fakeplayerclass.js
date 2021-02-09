//going to see if making a version of the actual player class would make it work better... probably not
(function() {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = getModule("events");
const Game_1 = __importDefault(require("./../node_modules/node-hill/dist/class/Game"));
const scripts = __importStar(require("./../node_modules/node-hill/dist/scripts"));
const PacketBuilder_1 = __importStar(require("./../node_modules/node-hill/dist/net/PacketBuilder"));
const playerIds_1 = __importDefault(require("./../node_modules/node-hill/dist/net/BrickHillPackets/playerIds"));
const Vector3_1 = __importDefault(require("./../node_modules/node-hill/dist/class/Vector3"));
const Tool_1 = __importDefault(require("./../node_modules/node-hill/dist/class/Tool"));
var CameraType;
(function (CameraType) {
    /**The camera is fixed in place. You can set the position of it. */
    CameraType["Fixed"] = "fixed";
    /**The camera is orbiting the cameraObject (a player). You cannot set the position of it. */
    CameraType["Orbit"] = "orbit";
    /**The camera is free-floating, the player can move it with WASD. (Glitchy and really bad). */
    CameraType["Free"] = "free";
    /**The player's camera is locked in first person. */
    CameraType["First"] = "first";
})(CameraType = exports.CameraType || (exports.CameraType = {}));
var PlayerEvents;
(function (PlayerEvents) {
    PlayerEvents["InitialSpawn"] = "initialSpawn";
    PlayerEvents["Died"] = "died";
    PlayerEvents["Respawn"] = "respawn";
    PlayerEvents["AvatarLoaded"] = "avatarLoaded";
    PlayerEvents["Chatted"] = "chatted";
    PlayerEvents["Moved"] = "moved";
})(PlayerEvents || (PlayerEvents = {}));
class FakePlayer extends events_1.EventEmitter {
    constructor(data) {
	this.socket={
		write: function(data) {
			console.log(data)
		}
	}
	    
        super();
        /** True if the player has left the game. */
        this.destroyed = false;
        /** The scale of the player. */
        this.scale = new Vector3_1.default(1, 1, 1);
        /** The value the player's health will be set to when they respawn. **/
        this.maxHealth = 100;
        /** If set to true, the server will reject any chat attempts from the player. **/
        this.muted = false;
        /** The current speed of the player. */
        this.speed = 4;
        /** How high the player can jump. */
        this.jumpPower = 5;
        /** The current score of the player. */
        this.score = 0;
        /** The current speech bubble of the player. ("" = empty). */
        this.speech = "";
        /** If set to false, the player will not automatically load their avatar. */
        this.loadAvatar = true;
        /** If set to false, the player will not spawn with their tool equipped. \
         * loadAvatar MUST be enabled for this to work.*/
        this.loadTool = true;
        this.roblox = true
        this.socket = socket;
        this.netId = data.userId
        this.userId = data.userId
        this.username = data.username
        this.localBricks = [];
        this._steps = [];
        this.inventory = [];
        this.blockedUsers = [];
        this.destroyed = false;
        this.spawnHandler = scripts.pickSpawn;
        this.position = new Vector3_1.default(0, 0, 0);
        this.rotation = new Vector3_1.default(0, 0, 0);
        this.scale = new Vector3_1.default(1, 1, 1);
        this.cameraFOV = 60;
        this.cameraDistance = 5;
        this.cameraPosition = new Vector3_1.default(0, 0, 0);
        this.cameraRotation = new Vector3_1.default(0, 0, 0);
        this.cameraType = CameraType.Fixed;
        this.cameraObject = this;
        this.colors = {
            head: "#d9bc00",
            torso: "#d9bc00",
            leftArm: "#d9bc00",
            rightArm: "#d9bc00",
            leftLeg: "#d9bc00",
            rightLeg: "#d9bc00",
        };
        this.assets = {
            tool: 0,
            face: 0,
            hat1: 0,
            hat2: 0,
            hat3: 0,
        };
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.alive = false;
        this.muted = false;
        this.speed = 4;
        this.speech = "";
        this.jumpPower = 5;
        this.score = 0;
        this.toolEquipped = null;
    }
    addListener(event, listener) { return super.addListener(event, listener); }
    /**
   * Calls back whenever the player clicks.
   * @callback
   * @example
   * ```js
   * player.mouseclick(() => {
   *    // The player clicked.
   * })
   * ```
   */
    mouseclick(callback) {
        let clickCallback = () => {
            callback();
        };
        this.on("mouseclick", clickCallback);
        return {
            disconnect: () => this.off("mouseclick", clickCallback)
        };
    }
    /**
   * Calls back whenever the player presses a key.
   * @callback
   * @example
   * ```js
   * Game.on("initialSpawn", (player) => {
   *    player.speedCooldown = false
   *
   *    player.keypress(async(key) => {
   *        if (player.speedCooldown) return
   *        if (key === "shift") {
   *            player.speedCooldown = true
   *
   *            player.bottomPrint("Boost activated!", 3)
   *
   *            player.setSpeed(8)
   *
   *            await sleep(3000)
   *
   *            player.setSpeed(4)
   *
   *            player.bottomPrint("Boost cooldown...", 6)
   *
   *            setTimeout(() => {
   *                player.speedCooldown = false
   *            }, 6000)
   *        }
   *    })
   * })
   * ```
   **/
    keypress(callback) {
        let kpCallback = (key) => {
            callback(key);
        };
        this.on("keypress", kpCallback);
        return {
            disconnect: () => this.off("keypress", kpCallback)
        };
    }
    /**
     * Kicks the player from the game.
     * @param message The kick message
     */
    kick(message) {
        let playeredit = Game.getPlayerEdit(this)
        playeredit.edits.kick=true
    }
    /**
     * Clears all of the bricks for the player. This is a LOCAL change. \
     * world.bricks will not be updated!
     */
    clearMap() {
        let playeredit = Game.getPlayerEdit(this)
        playeredit.edits.clearmap=true
    }
    _log(message, broadcast = false) {
        if (broadcast==true) {
            Game.messageAll(message)
        } else {
            this.message(message)
        }
    }
    _removePlayer() {
    /*
        return __awaiter(this, void 0, void 0, function* () {
            return new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.RemovePlayer)
                .write("uint32", this.netId)
                .broadcastExcept([this]);
        });
    */
    }
    topPrint(message, seconds) {
        let playeredit=Game.getPlayerEdit(this)
        playeredit.edits.topPrint={message: message, seconds: seconds}
    }
    centerPrint(message, seconds) {
        let playeredit=Game.getPlayerEdit(this)
        playeredit.edits.centerPrint={message: message, seconds: seconds}
    }
    bottomPrint(message, seconds) {
        let playeredit=Game.getPlayerEdit(this)
        playeredit.edits.bottomPrint={message: message, seconds: seconds}
    }
    /** Prompts a confirm window on the player's client. */
    prompt(message) {
        this.message(message)
    }
    /**
     * Sends a local message to the player.
     * @param message The message
     */
    message(message, filtered=false) {
          let playeredit = getPlayerEdit(this)
					playeredit.serverMessages.push({
						msg:msg,
						filtered:filtered
					});
    }
    /** Sends a chat message to everyone, conforming to rate-limit / mute checks, etc. */
    messageAll(message) {
        Game.messageAll(message, true)
    }
    setOutfit(outfit) {
        return __awaiter(this, void 0, void 0, function* () {
        let playeredit=Game.getPlayerEdit(this)
        playeredit.edits.outfit={colors:outfit.colors}
            return playerIds_1.default(this, outfit.idString)
                .broadcast();
        });
    }
    /** Sets the players health. If the health provided is larger than maxHealth, maxHealth will automatically be \
     *  set to the new health value.
     */
    setHealth(health) {
        return __awaiter(this, void 0, void 0, function* () {
            if (health <= 0 && this.alive) {
                return this.kill();
            }
            else {
            let playeredit=Game.getPlayerEdit(this)
                if (health > this.maxHealth) {
                    this.maxHealth = health;
                    playeredit.edits.maxHealth=health
                }
                playeredit.edits.health=health
                this.health = health;
            }
        });
    }
    setScore(score) {
        return __awaiter(this, void 0, void 0, function* () {
            this.score = score;
            let edit = Game.getPlayerEdit(this)
            edit.edits.score=score
            return playerIds_1.default(this, "X")
                .broadcast();
        });
    }
    setTeam(team) {
        return __awaiter(this, void 0, void 0, function* () {
        		let playerEdit=getPlayerEdit(this)
				  	playerEdit.edits.team=team.netId
            this.team = team;
            return playerIds_1.default(this, "Y")
                .broadcast();
        });
    }
    _greet() {
        if (Game_1.default.MOTD) {
            this._log(Game_1.default.MOTD);
        }
        this._log(`\\c6[SERVER]: \\c0${this.username} has joined the server!`, true);
    }
    setCameraPosition(position) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.cameraPosition = new Vector3_1.default().fromVector(position);
            return playerIds_1.default(this, "567")
                .send(this.socket);
        });
        */
    }
    setCameraRotation(rotation) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.cameraRotation = new Vector3_1.default().fromVector(rotation);
            return playerIds_1.default(this, "89a")
                .send(this.socket);
        });
        */
    }
    setCameraDistance(distance) {
        return _
        /*
        _awaiter(this, void 0, void 0, function* () {
            this.cameraDistance = distance;
            return playerIds_1.default(this, "4")
                .send(this.socket);
        });
        */
    }
    setCameraFOV(fov) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.cameraFOV = fov;
            return playerIds_1.default(this, "3")
                .send(this.socket);
        });
        */
    }
    setCameraObject(player) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.cameraObject = player;
            return playerIds_1.default(this, "c")
                .send(this.socket);
        });
        */
    }
    setCameraType(type) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.cameraType = type;
            return playerIds_1.default(this, "b")
                .send(this.socket);
        });
        */
    }
    /** Returns an arary of all the players currently blocking this user. */
    getBlockedPlayers() {
        let players = [];
        for (let target of Game_1.default.players) {
            if (target.blockedUsers.includes(this.userId))
                players.push(target);
        }
        return players;
    }
    /** Adds the tool to the user's inventory. */
    addTool(tool) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            if (this.inventory.includes(tool))
                return Promise.reject("Player already has tool equipped.");
            this.inventory.push(tool);
            return scripts.toolPacket.create(tool)
                .send(this.socket);
        });
        */
    }
    /** Takes an array of bricks and loads them to the client locally. */
    loadBricks(bricks) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            return scripts.loadBricks(bricks)
                .send(this.socket);
        });
        */
    }
    /** Takes an array of bricks, and deletes them all from this client. */
    deleteBricks(bricks) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            return scripts.deleteBricks(bricks)
                .send(this.socket);
        });
        */
    }
    /** Forces the player to unequip the tool, and removes it from their inventory. */
    destroyTool(tool) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            const index = this.inventory.indexOf(tool);
            if (index === -1)
                return; // Tool not found.
            this.inventory.splice(index, 1);
            return scripts.toolPacket.destroy(tool)
                .send(this.socket);
        });
        */
    }
    /** Equips the tool, if It's not already in the user's inventory it will be added first. \
     * If you call this on a tool that is already equipped, it will be unequipped.
     */
    equipTool(tool) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            // They don't have the tool, add it first.
            if (!this.inventory.includes(tool))
                yield this.addTool(tool);
            let currentTool = this.toolEquipped;
            // Tool is already equpped, unequip it.
            if (currentTool === tool)
                return this.unequipTool(tool);
            // The player switched tools, inform the other one it's unequipped.
            if (currentTool)
                currentTool.emit("unequipped", this);
            this.toolEquipped = tool;
            tool.emit("equipped", this);
            return playerIds_1.default(this, "g")
                .broadcast();
        });
        */
    }
    /** Unequips the tool from the player, but does not remove it from their inventory. */
    unequipTool(tool) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.toolEquipped = null;
            tool.emit("unequipped", this);
            return playerIds_1.default(this, "h")
                .broadcast();
        });
        */
    }
    setSpeech(speech = "") {
        return __awaiter(this, void 0, void 0, function* () {
            this.speech = speech;
            let edit = Game.getPlayerEdit(this)
            edit.edits.speech=speech
            return playerIds_1.default(this, "f")
                .broadcastExcept(this.getBlockedPlayers());
        });
    }
    setSpeed(speedValue) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.speed = speedValue;
            return playerIds_1.default(this, "1")
                .send(this.socket);
        });
        */
    }
    setJumpPower(power) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            this.jumpPower = power;
            return playerIds_1.default(this, "2")
                .send(this.socket);
        });
        */
    }
    _getClients() {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            // There are no other clients to get.
            if (Game_1.default.playerCount <= 1)
                return;
            // Send all other clients this client.
            yield new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.SendPlayers)
                .write("uint8", 1)
                .write("uint32", this.netId)
                .write("string", this.username)
                .write("uint32", this.userId)
                .write("uint8", this.admin)
                .write("uint8", this.membershipType)
                .broadcastExcept([this]);
            let packet = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.SendPlayers);
            let count = 0;
            // Send this client all other clients.
            for (let player of Game_1.default.players) {
                if (player !== this) {
                    packet.write("uint32", player.netId);
                    packet.write("string", player.username);
                    packet.write("uint32", player.userId);
                    packet.write("uint8", player.admin);
                    packet.write("uint8", player.membershipType);
                    count++;
                }
            }
            if (count > 0) {
                packet.buffer.insertUInt8(count, 1);
                return packet.send(this.socket);
            }
        });
        */
    }
    /**@hidden */
    _updatePositionForOthers(pos) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            let idBuffer = "";
            if (pos[0] && this.position.x != pos[0]) {
                idBuffer += "A";
                this.position.x = pos[0];
            }
            if (pos[1] && this.position.y != pos[1]) {
                idBuffer += "B";
                this.position.y = pos[1];
            }
            if (pos[2] && this.position.z != pos[2]) {
                idBuffer += "C";
                this.position.z = pos[2];
            }
            if (pos[3] && this.rotation.z != pos[3]) {
                idBuffer += "F";
                this.rotation.z = pos[3];
            }
            if (idBuffer.length) {
                this.emit("moved", this.position, this.rotation.z);
                return playerIds_1.default(this, idBuffer)
                    .broadcastExcept([this]);
            }
        });
        */
    }
    /**Clones a brick locally to the player's client, returns the newly created local brick. */
    newBrick(brick) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            let localBrick = brick.clone();
            localBrick.socket = this.socket;
            this.localBricks.push(localBrick);
            const packet = new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.SendBrick);
            scripts.addBrickProperties(packet, localBrick);
            yield packet.send(this.socket);
            return localBrick;
        });
        */
    }
    setPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            let edit=Game.getPlayerEdit(this)
            edit.edits.position=position
            this.position = new Vector3_1.default().fromVector(position);
            this.emit("moved", this.position, this.rotation.z);
            const packetBuilder = playerIds_1.default(this, "ABCF");
            return packetBuilder.broadcast();
        });
    }
    setScale(scale) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scale = new Vector3_1.default().fromVector(scale);
            const packetBuilder = playerIds_1.default(this, "GHI");
            return packetBuilder.broadcast();
        });
    }
    /**
     * Sets the appearance of the player. \
     * If a userId isn't specified, it will default to the player's userId.
     *
     * Error handling is highly recommended as this function makes a HTTP request.
     */
    setAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield scripts.setAvatar(this, userId);
            let packet = playerIds_1.default(this, "KLMNOPQUVW");
            return packet.broadcast();
        });
    }
    /**
   * Returns player stats in JSON from this API: \
   * https://api.brick-hill.com/v1/user/profile?id={userId}
   * @example
   * ```js
   * Game.on("playerJoin", async(player) => {
   *  const data = await player.getUserInfo()
   *  console.log(data)
   * })
  * ```
   */
    getUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.getUserInfo(1);
        });
    }
    /**
     * Returns true or false if the player owns a specified assetId.
     *
     * @example
     * ```js
     * Game.on("initialSpawn", async(p) => {
     *      let ownsAsset = await p.ownsAsset(106530)
     *      console.log("Player owns asset: ", ownsAsset)
     * })
    ```
     */
    ownsAsset(assetId, rbxAssetId) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            return scripts.playerOwnsAsset(this.userId, assetId);
        });
        */
    }
    /**
     * Returns JSON data of the users rank in a group, or false if they aren't in the group. \
     * https://api.brick-hill.com/v1/clan/member?id=1&user=1
     * @example
     * ```js
     * Game.on("playerJoin", async(player) => {
     *  const groupData = await player.getRankInGroup(5)
     *  if (groupData) {
     *      console.log(groupData)
     *  } else {
     *      console.log("Player is not in group.")
     *  }
     * })
    * ```
     */
    getRankInGroup(groupId) {
        return 
        /*
        __awaiter(this, void 0, void 0, function* () {
            return scripts.getRankInGroup(groupId, this.userId);
        });
        */
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            this.alive = false;
            this.health = 0;
            yield new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.Kill)
                .write("float", this.netId)
                .write("bool", true)
                .broadcast();
            let edit=Game.getPlayerEdit(this)
            edit.edits.kill=true
            this.emit("died");
        });
    }
    /** Respawns the player. */
    respawn() {
        return __awaiter(this, void 0, void 0, function* () {
            let newSpawnPosition;
            if (this.spawnPosition) {
                newSpawnPosition = this.spawnPosition;
            }
            else {
                newSpawnPosition = (yield this.spawnHandler(this)) || scripts.pickSpawn();
            }
            yield this.setPosition(newSpawnPosition);
            yield new PacketBuilder_1.default(PacketBuilder_1.PacketEnums.Kill)
                .write("float", this.netId)
                .write("bool", false)
                .broadcast();
            this.alive = true;
            this.health = this.maxHealth;
            this.cameraType = CameraType.Orbit;
            this.cameraObject = this;
            this.cameraPosition = new Vector3_1.default(0, 0, 0);
            this.cameraRotation = new Vector3_1.default(0, 0, 0);
            this.cameraFOV = 60;
            this.toolEquipped = null;
            let edit=Game.getPlayerEdit(this).
            edit.edits.respawn=true
            this.emit("respawn");
        });
    }
    /**
     * Identical to setInterval, but will be cleared after the player is destroyed.
     * Use this if you want to attach loops to players, but don't want to worry about clearing them.
     * @param callback The callback function.
     * @param delay The delay in milliseconds.
     */
    setInterval(callback, delay) {
        let loop = setInterval(callback, delay);
        this._steps.push(loop);
        return loop;
    }
    /**
     * Functionally the same to Game.setEnvironment, but sets the environment only for one player.
     * @example
     * ```js
     * Game.on("playerJoin", (p) => {
     *  p.setEnvironment( {skyColor: "6ff542"} )
     * })
     */
    setEnvironment(environment) {
        return __awaiter(this, void 0, void 0, function* () {
            return scripts.setEnvironment(environment, this.socket);
        });
    }
    _createFigures() {
        // Update player's figure for others
        playerIds_1.default(this, "ABCDEFGHIKLMNOPQUVWXYfg")
            .broadcastExcept([this]);
        /*
         Update other figures for this player
        for (let player of Game_1.default.players) {
            if (player !== this) {
                playerIds_1.default(player, "ABCDEFGHIKLMNOPQUVWXYfg")
                    .send(this.socket);
            }
        }
        */
    }
    _createTeams() {
        return
        for (let team of Game_1.default.world.teams) {
            scripts.teamPacket.create(team)
                .send(this.socket);
        }
    }
    _createBots() {
        return
        for (let bot of Game_1.default.world.bots) {
            scripts.botPacket(bot)
                .send(this.socket);
        }
    }
    /**@hidden */
    _left() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.username} has left the game.`);
            yield this._removePlayer();
            this._log(`\\c6[SERVER]: \\c0${this.username} has left the server!`, true);
            this.removeAllListeners();
            this._steps.forEach((loop) => {
                clearInterval(loop);
            });
            this.destroyed = true;
        });
    }
    /**@hidden */
    _joined() {
        return __awaiter(this, void 0, void 0, function* () {
            // Send player their information + brick count.
            yield scripts.sendAuthInfo(this);
            yield this._getClients();
            console.log(`${this.username} has joined | netId: ${this.netId}`);
            this._greet();
            yield this.setEnvironment(Game_1.default.world.environment);
            if (Game_1.default.sendBricks) {
                let map = scripts.loadBricks(Game_1.default.world.bricks);
                if (map)
                    yield map.send(this.socket);
            }
            this._createTeams();
            this._createBots();
            if (Game_1.default.assignRandomTeam && Game_1.default.world.teams.length)
                this.setTeam(Game_1.default.world.teams[Math.floor(Math.random() * Game_1.default.world.teams.length)]);
            if (Game_1.default.playerSpawning)
                yield this.respawn();
            this._createFigures();
            if (this.loadAvatar) {
                yield this.setAvatar(this.userId)
                    .then(() => {
                    this.emit("avatarLoaded");
                })
                    .catch((err) => {
                    console.error(`Failure loading avatar appearance for ${this.username}: \n`, err.stack);
                });
                if (this.loadTool && this.assets.tool) {
                    const tool = new Tool_1.default("Tool");
                    tool.model = this.assets.tool;
                    yield this.addTool(tool);
                }
            }
            this.mouseclick(() => {
                this.toolEquipped && this.toolEquipped.emit("activated", this);
            });
            this.emit("initialSpawn");
        });
    }
}
exports.default = FakePlayer;
/**
* Fires once when the player fully loads. (camera settings, map loads, players downloaded, etc).
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("initialSpawn", () => {
*        player.prompt("Hello there!")
*    })
* })
* ```
*/
FakePlayer.initialSpawn = PlayerEvents.InitialSpawn;
/**
* Fires whenever a player dies (health set to 0).
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("died", () => {
*        player.kick("This is a hardcore server.")
*    })
* })
* ```
*/
FakePlayer.died = PlayerEvents.Died;
/**
* Fires whenever a player spawns (respawn() is called.)
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("respawn", () => {
*        player.setHealth(1000)
*    })
* })
* ```
*/
FakePlayer.respawn = PlayerEvents.Respawn;
/**
* Fires whenever a player's outfit loads.
* @event
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("avatarLoaded", () => {
*        // The outfit is now loaded.
*    })
* })
* ```
*/
FakePlayer.avatarLoaded = PlayerEvents.AvatarLoaded;
/**
* Fires whenever the player chats. Functionality-wise this behaves like `Game.on("chatted")`.
* @event
* @param message Message
* @example
* ```js
* Game.on("playerJoin", (player) => {
*    player.on("chatted", (message) => {
*        // The player chatted.
*    })
* })
* ```
*/
FakePlayer.chatted = PlayerEvents.Chatted;
/**
 * Fires whenever this player moves.
 * @event
 * @param newPosition The new position of the player
 * @param newRotation The new rotation of the player
 * ```js
 * player.on("moved", (newPosition, newRotation)=>{
 *    console.log(`${player.username} moved to ${newPosition.x}, ${newPosition.y}, ${newPosition.z}`)
 * })
 */
FakePlayer.moved = PlayerEvents.Moved;
FakePlayer.playerId = 0;
	
return exports
})()
