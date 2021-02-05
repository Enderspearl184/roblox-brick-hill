--dummy score is located in the leaderstats folder of their model.
--incase your version of the roblox place is before i added the loader, add this to serverscriptservice and remove all the other scripts and guis and stuff
_G.differentServer=false --set to true only if testing on studio using a different device than what you are hosting on
_G.port=42481 --use this for the port of the server
_G.url="urlherelol" --set this to the url or ip the server is running on
_G.UseModel=true --keep this to true, setting it to false may cause bugs as it uses whatever your version has, instead of downloading the model


local scriptfolder
local storage=game:GetService("ServerStorage")
local rstorage=game:GetService("ReplicatedStorage")
local ssservice=game:GetService("ServerScriptService")
local gui=game:GetService("StarterGui")
local plrscripts=game:GetService("StarterPlayer").StarterPlayerScripts
if (_G.UseModel==false) then
	scriptfolder=storage.ScriptFolder
else
	scriptfolder=game:GetService("InsertService"):LoadAsset(6347776275).ScriptFolder
	scriptfolder.Parent=storage
end

for _,v in pairs(scriptfolder.ReplicatedStorage:GetChildren()) do
	v.Parent=rstorage
end

for _,v in pairs(scriptfolder.ServerScriptService:GetChildren()) do
	v.Parent=ssservice
end

for _,v in pairs(scriptfolder.StarterGui:GetChildren()) do
	v.Parent=gui
end

for _,v in pairs(scriptfolder.StarterPlayerScripts:GetChildren()) do
	v.Parent=plrscripts
end


ssservice.RobloxScript.Disabled=false
