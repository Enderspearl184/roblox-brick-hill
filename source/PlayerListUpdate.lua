return function()
	local playerNames={}
	local teamNames=_G.teams --(to be implemented later)
	for _,player in pairs(game.Players:GetPlayers()) do
		table.insert(playerNames, #playerNames+1, {name=player.Name,score=player.leaderstats.Score.Value, teamId=player.teamId.Value})
	end
	for _,v in pairs(_G.fakeplayers) do
		if (v:FindFirstChild("Humanoid")) then
			table.insert(playerNames, #playerNames+1,{name = v.Humanoid.DisplayName, score=v.leaderstats.Score.Value, teamId=v.teamId.Value})
		end
	end
	game.ReplicatedStorage.playerList:FireAllClients(playerNames, teamNames)
end
