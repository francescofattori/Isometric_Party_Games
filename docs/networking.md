---
title: Networking
filename: networking.md
--- 
# Networking
each game should work offline, online or both using the same exact main function stored in the main.mjs file.\
on the index.html the main function gets called by the client enviroment that handles network communications with the server,
it's important than it can distiguish between offline and online mode to execute main on the client or on the server\
client global variable that stores localPlayers, onlinePlayers and players, server infos and online mode or not
client.mjs manages game run on client, has two loops for offline and online mode
server.mjs manages hosting website (optional), hosting mode (http, https), and client networking
everything should be managed (disconnecting of players, players can enter game or not, spectate mode); functions should be redefinable for the specific game (onPlayerDisconnect, onClientDisconnect?...)
session code for reconnecting without losing data
client and server communicate by the interlayer main that need to be readable (executing different code) by both (achieved by server and client different classes)
main should have a start and an update function, nothing more
for each games functions should be defined for the server and for the client separately (everything can be coded for offline and then made online later)
each room in the server will have it's own scene and world that run the update function of the specific game
in theory the main file should contain in the start function object definition for custom classes and in update update all the created objects, the rest of the game is driven by the engine
(this is meant to be a pretty small and straight forward engine that does just the right amount of stuff but good so that it's easy to make a pretty game in a short time)


events:
	addPlayer <->
	removePlayer <->
	joinRequest ->
	scene <-
	update <->
-client side
	socket;
	connectToServer(url, port); //starts socket.io interval trying to connect that sets (check socket.connected so see if connected to server)



-server side
	still needs assets system with cache