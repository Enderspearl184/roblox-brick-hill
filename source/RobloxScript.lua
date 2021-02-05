local http = game:GetService("HttpService")
local players = game:GetService("Players")
local text = game:GetService("TextService")
local storage = game:GetService("ServerStorage")
local PhysicsService = game:GetService("PhysicsService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local plUpdate=require(script.Parent.PlayerListUpdate)
local ColorModule = require(game.ReplicatedStorage.ColorModule)
local ChatModule = 	require(script.Parent.ChatModule)
local scoreName="Score"
local chattable = {}
_G.fakeplayers = {}
_G.teams={}

local playerCollisionGroupName = "Players"
PhysicsService:CreateCollisionGroup(playerCollisionGroupName)
PhysicsService:CollisionGroupSetCollidable(playerCollisionGroupName, playerCollisionGroupName, false)

local function setCollisionGroupRecursive(object)
	if object:IsA("BasePart") then
		PhysicsService:SetPartCollisionGroup(object, playerCollisionGroupName)
	end
	for _, child in ipairs(object:GetChildren()) do
		setCollisionGroupRecursive(child)
	end
end

local function onCharacterAdded(character)
	setCollisionGroupRecursive(character)
end

local function leaderboardSetup(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player
	
	local score = Instance.new("IntValue")
	score.Name = "Score"
	score.Value = 0
	score.Parent = leaderstats	
	
	local teamId = Instance.new("IntValue")
	teamId.Name = "teamId"
	teamId.Value = 0
	teamId.Parent = player
end

local function onPlayerAdded(player)
	leaderboardSetup(player)
	plUpdate()
	player.CharacterAdded:Connect(onCharacterAdded)
	player.Chatted:Connect(function(msg)
		local chatobject = {
			username = player.Name,
			message = msg
		}
		print(chatobject.message)
		table.insert(chattable, chatobject)
	end)
end

players.PlayerAdded:Connect(onPlayerAdded)

local function say(msg,dummy)
	for _,v in pairs(players:GetPlayers()) do
		ChatModule.SystemSay(msg,v,true)
	end
	--game:GetService("ReplicatedStorage").LocalChatRemote:FireAllClients(msg, cv1, cv2, cv3)
end

local function getuserid()
	return players:GetChildren()[1].UserId
end

local function setScore(player,score)
	player.leaderstats[scoreName].Value=score
end
local function setTeam(player,teamId)
	player.teamId.Value=teamId
end

if game:GetService("RunService"):IsStudio() and (not _G.differentServer) then
	_G.url="http://127.0.0.1"
elseif game.PlaceId==5886668460 then
	_G.url="http://enderspearl185.ddns.net" --someone already took enderspearl184.ddns.net please don't take this one or i'll be very mildly annoyed
end

_G.url=_G.url .. ":" .. _G.port

print(_G.url)

while wait(0.2) do
	local playerjson = {
		players = {},
		chat = chattable
	}
	chattable = {}
	for i,v in pairs(players:GetChildren()) do --getting player data
		local character = v.Character
		local alive=true
		if (not character) or (not character.Parent) or (not character:FindFirstChild("HumanoidRootPart")) or (character:FindFirstChild("Humanoid").Health==0) then
			alive=false
		end
		local playerobject = {
			username = v.Name,
			netId = v.UserId,
			alive=alive,
		}
		if alive then
			playerobject.position = {
				x = character.HumanoidRootPart.Position.x,
				y = character.HumanoidRootPart.Position.z,
				z = character.HumanoidRootPart.Position.y-3.5
			}
			if (character:FindFirstChild("Body Colors")) then --this shit
				playerobject.colors = {
					head = ColorModule.rgbToHex(character["Body Colors"].HeadColor3),
					leftArm = ColorModule.rgbToHex(character["Body Colors"].LeftArmColor3),
					rightArm = ColorModule.rgbToHex(character["Body Colors"].RightArmColor3),
					rightLeg = ColorModule.rgbToHex(character["Body Colors"].RightLegColor3),
					leftLeg = ColorModule.rgbToHex(character["Body Colors"].LeftLegColor3),
					torso = ColorModule.rgbToHex(character["Body Colors"].TorsoColor3),
				}
			end
			playerobject.rotation = character.HumanoidRootPart.Orientation.y
		else
			playerobject.alive=false
		end
		table.insert(playerjson.players, playerobject)
	end
	local playerencoded = http:JSONEncode(playerjson)
	--print(playerencoded)
	local httpsuccess, data = pcall(function()
		return http:PostAsync(_G.url .. "/POSTplayerValues",playerencoded) --do http stuff
	end)
	if httpsuccess then
		local bhdata = http:JSONDecode(data)

		--Removing Dummies Part
		local tempDummyIds = {}
		for i,value in ipairs(bhdata.players) do
			table.insert(tempDummyIds, "NetId" .. value.netId)
		end

		for i,value in pairs(_G.fakeplayers) do
			if (not table.find(tempDummyIds, i)) or (not value.Parent) or (value.Humanoid.Health==0) then
				value:Destroy()
				table.remove(_G.fakeplayers, table.find(_G.fakeplayers, value))
			end
		end

		--Creating Dummies Part
		for i,value in pairs(bhdata.players) do
			if (not _G.fakeplayers["NetId" .. value.netId]) or (not _G.fakeplayers["NetId" .. value.netId].Parent==workspace.Dummies) or (not _G.fakeplayers["NetId" .. value.netId]:FindFirstChild("Humanoid")) then
				local Dummy = storage.Dummy:Clone()
				_G.fakeplayers["NetId" .. value.netId] = Dummy
				Dummy.Parent=workspace.Dummies
				setCollisionGroupRecursive(Dummy)
				leaderboardSetup(Dummy)
			end
		end

		--Updating Dummies Part
		for i,value in pairs(bhdata.players) do
			local Dummy = _G.fakeplayers["NetId" .. value.netId]
			if Dummy and Dummy:FindFirstChild("Humanoid") then
				--update displayname
				Dummy.Humanoid.DisplayName=value.username
				--update health/max health
				Dummy.Humanoid.MaxHealth=value.health.maxHealth
				Dummy.Humanoid.Health=value.health.Health
				--updating body colours
				Dummy["Body Colors"].HeadColor3=ColorModule.hexToRGB(value.colors.head)
				Dummy["Body Colors"].LeftArmColor3=ColorModule.hexToRGB(value.colors.leftArm)
				Dummy["Body Colors"].RightArmColor3=ColorModule.hexToRGB(value.colors.rightArm)
				Dummy["Body Colors"].LeftLegColor3=ColorModule.hexToRGB(value.colors.leftLeg)
				Dummy["Body Colors"].RightLegColor3=ColorModule.hexToRGB(value.colors.rightLeg)
				Dummy["Body Colors"].TorsoColor3=ColorModule.hexToRGB(value.colors.torso)
				setScore(Dummy, value.score)
				setTeam(Dummy, value.team)
				--updating position
				if Dummy:FindFirstChild("HumanoidRootPart") then
					Dummy.HumanoidRootPart.CFrame = CFrame.new(Vector3.new(value.position.x,value.position.y+3.5,value.position.z))
					Dummy.HumanoidRootPart.CFrame = Dummy.HumanoidRootPart.CFrame * CFrame.Angles(0,math.rad(value.rotation),0)
				end
			end
		end
		
		--Updating teams part
		_G.teams=bhdata.teams
		
		plUpdate()

		--Chat part
		for name,value in ipairs(bhdata.chat) do
			print(value.netId)
			print(value.chat)
			local chatarr = string.split(value.chat, ":")
			local success, chatText = pcall(function()
				return text:FilterStringAsync(chatarr[2], getuserid())
			end) 
			if success then
				local FilteredChatText=chatText:GetNonChatStringForBroadcastAsync()
				local chatmessage = chatarr[1] .. ":" .. FilteredChatText
				say(chatmessage)
				local chatsuccess = pcall(function() game.Chat:Chat(_G.fakeplayers["NetId" .. value.netId].Head, FilteredChatText, Enum.ChatColor.White) end)
				if (not chatsuccess) then
					warn("NetId " .. value.netId .. " doesn't have a dummy...")
				end
			else
				for i,value in pairs(_G.fakeplayers) do
					value:Destroy()
					table.remove(_G.fakeplayers, table.find(_G.fakeplayers, i))
				end
			end
		end

		--playeredits part
		for _,edit in ipairs(bhdata.ghostPlayerEdits) do
			local player = players:findFirstChild(edit.username)
			if player then
				if edit.edits.respawn then --respawn
					player:LoadCharacter()
				elseif edit.edits.kill then --kill
					print("hello")
					player.Character.Humanoid.Health=0
				end
				if edit.edits.health then --sethealth
					if edit.edits.health>player.Character.Humanoid.MaxHealth then
						player.Character.Humanoid.MaxHealth=edit.edits.health
					end
					player.Character.Humanoid.Health=edit.edits.health
				end
				if edit.edits.kick then --kick
					player:Kick()
				end
				if edit.edits.position then --setposition
					pcall(function()player.Character.HumanoidRootPart.CFrame=CFrame.new(edit.edits.position.x,edit.edits.position.y,edit.edits.position.z)end)
				end
				if edit.edits.score then --setscore
					setScore(player, edit.edits.score)
				end
				if edit.edits.team then --setteam
					setTeam(player, edit.edits.team)
				end
				if edit.serverMessages then
					for _,v in ipairs(edit.serverMessages) do
						print(v.msg)
						print(v.filtered)
						ChatModule.SystemSay(v.msg,player,v.filtered)
					end
				end
			else
				warn("Player to edit doesn't exist!")
			end
		end
		
		local function doesBrickExist(netId, brickdata)
			local exist=false
			for _,v in pairs(brickdata) do
				if (v.netId==tonumber(netId)) or netId=="Baseplate" then
					exist=true
				end
			end
			return exist
		end
		
		local function updateBrick(brick,v) --self explanatory
			brick.Position=Vector3.new(v.position.x,v.position.y,v.position.z)
			brick.Color=ColorModule.hexToRGB(v.Color)
			brick.Orientation=Vector3.new(0,v.Rotation,0)
			brick.Transparency=v.Transparency
			brick.CanCollide=v.CanCollide
			brick.Size=Vector3.new(v.scale.x,v.scale.y,v.scale.z)
		end
		
		--bricks part
		spawn(function()
			local brickdata=bhdata.bricks
			
			for _,v in pairs(brickdata) do --add/update bricks
				local brick=workspace.Bricks:FindFirstChild(v.netId)
				if brick then
					updateBrick(brick,v)
				else
					brick=storage.ExampleBrick:Clone()
					brick.Name=v.netId
					brick.Parent=workspace.Bricks
					updateBrick(brick,v)
				end
			end
			
			for _,v in pairs(workspace.Bricks:GetChildren()) do
				if doesBrickExist(v.Name,brickdata)==false then
					v:Destroy()
				end
			end
		end)

	else
		warn("HTTP Error")
		plUpdate()
	end
end

local function onCharacterAdded(character)
	setCollisionGroupRecursive(character)
end

local function onPlayerAdded(player)
	player.CharacterAdded:Connect(onCharacterAdded)
end

players.PlayerAdded:Connect(onPlayerAdded)
