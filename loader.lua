--dummy score is located in the leaderstats folder of their model.
_G.differentServer=false --if you are hosting this on a different computer than what you are testing this in studio, set this to True
_G.port=42481 --use this for the port of the server
_G.url="urlherelol" --set this to the url or ip the server is running on
_G.UseModel=false --keep this to true


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
