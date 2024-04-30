import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import moment from "moment-timezone";
import { Room } from "./models/Room";
// import { data } from "jquery";
import { Message } from "./models/Message";

moment.tz.setDefault("Europe/Stockholm");
moment.locale("sv");

let roomList: Room[] = [
	{
		id: "2024-03-07 15:12:14",
		roomName: "main",
		users: ["loppan_123", "grodanboll", "pelle_kanin"],

		messages: [
			{
				message: "hej alla!",
				cratedAt: "2024-03-05 12:14:07",
				room: "main",
				user: { username: "loppan_123", image: "/src/assets/avatar5.webp" },
			},
			{
				message: "hej loppan!",
				cratedAt: "2024-03-05 15:12:04",
				room: "main",
				user: { username: "grodanboll", image: "/src/assets/avatar3.webp" },
			},
		],
	},

	{
		id: "2024-03-07 15:12:05",
		roomName: "room 1",
		users: ["loppan_123", "grodanboll", "pelle_kanin"],

		messages: [
			{
				message: "hej hej",
				cratedAt: "2024-03-07 15:12:06",
				room: "room 1",
				user: { username: "loppan_123", image: "/src/assets/avatar3.webp" },
			},

			{
				message: "hej loppan!",
				cratedAt: "2024-03-07 15:15:00",
				room: "room 1",
				user: { username: "pelle_kanin", image: "/src/assets/avatar4.webp" },
			},

			{
				message: "hej alla!",
				cratedAt: "2024-03-07 15:15:10",
				room: "room 1",
				user: { username: "grodanboll", image: "/src/assets/avatar5.webp" },
			},
		],
	},
];

const PORT = 3000 || 'https://good-jade-iguana-wear.cyclic.app/';
const app = express();

app.use(cors());
app.get("https://good-jade-iguana-wear.cyclic.app", (req, res) => {
	res.send("Hello World");
});

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
	/* När användaren valt använtaren och kommer in på sidan så ges alla meddelanden som finns i main-room */

/* 	const r = roomList.filter((item) => item.roomName === "main");

	socket.emit("mainRoom", r); */

	socket.on(
		"update-message",
		(newUppdateMessage: Message, selectedRoom, callback) => {
			let updateMessage = roomList.find(
				(rooms) => rooms.roomName === selectedRoom.roomName
			);
			if (updateMessage) {
				let hello = updateMessage.messages.map((message) => {
					if (
						message.cratedAt === newUppdateMessage.cratedAt &&
						message.user.username === newUppdateMessage.user.username
					) {
						return { ...message, message: newUppdateMessage.message };
					} else {
						return message;
					}
				});

				let updatedRoom = { ...updateMessage, messages: hello };

				if (updatedRoom) {
					let updatedList = roomList.map((item) => {
						if (item.roomName === updatedRoom.roomName) {
							return updatedRoom;
						} else {
							return item;
						}
					});

					roomList = updatedList;
				}

				callback(updatedRoom);
				io.to(selectedRoom.roomName).emit("room_conect", updatedRoom);
			} else {
				console.log("no room found");
			}
		}
	);

	/* skapa ett rum om ett rum inte redan finns genom att kontrollera om username och searchUserForRoom inkluderas tillsammans vilket i rummets namn */

	socket?.on("create_room", (username, searchUserForRoom, callback) => {
		let roomExist = roomList.find(
			(item) =>
				item.roomName.includes(username) &&
				item.roomName.includes(searchUserForRoom)
		);

		const userExist = roomList.find((item) =>
			item.users.includes(searchUserForRoom)
		);
		if (!roomExist && userExist) {
			roomList.push({
				id: moment().format("YYYY-MM-DD HH:mm:ss"),
				roomName: `${username} ${searchUserForRoom}`,
				users: [username, searchUserForRoom],
				messages: [],
			});

			let r: Room[] = [];
			let otherRoom: Room[] = [];
			roomList.map((item) => {
				if (item.users.includes(username)) {
					r.push(item);
				}
				if (item.users.includes(searchUserForRoom)) {
					otherRoom.push(item);
				}
			});

			if (r) {
				callback(r);
				io.emit(`${searchUserForRoom}`, otherRoom);
			}
		}
	});

	socket?.on("send_message", (createNewMessage: Message) => {
		let newMessage = roomList.find(
			(room) => room.roomName === createNewMessage.room
		);
		if (newMessage) {
			newMessage.messages.push(createNewMessage);

			io.to(newMessage.roomName).emit("room_conect", newMessage);
		} else {
			console.log("no room found");
		}
	});

	/* användare får all rum som den tillhör skickat till sig */
	socket.on("allroomsForUser", (localStorageUser, usernames, callback) => {
		let getvalid = false;

    

		let roomUserList: Room[] = [];
		roomList.forEach((room) => {
			/* Lägger till användaren i main om användaren inte redan finns */
			roomList.map((item) => {
				/* kollar i main, där alla användare loggas */
				if (item.roomName === "main" ) {
					let array = item.users.filter((user) => user === usernames);
  
					/* om ianvändarnamnet saknas kommer arrayens längd vara 0 */
					if (array.length === 0 ) {
						item.users.push(usernames);

						/*  vilka rum användaren är med i */
						const getroom = room.users.find((item) => item === usernames);
						if (getroom) {
            
							roomUserList.push({ ...room });}
						
					}
					/* om användaren har valt ett tidigare username - från localstorage */
					else if (localStorageUser ) {
            item.users.push(localStorageUser);
						/* soterar ut vilka rum användaren är med i */
						const getroom = room.users.find(
							(item) => item === localStorageUser
						);
						if (getroom) {
							roomUserList.push({ ...room });
						}
					}

          
				}
			});
		});

		if (roomUserList.length !== 0 ) {
  
			callback(true, roomUserList);
		} else {
			callback(false);
		}
	});
	/* Användare ansluter till rum */
	socket.on("join_room", (roomName: string, username: string, callback) => {
		socket.rooms.forEach((room) => {
			socket.leave(room);
		});

		socket.join(roomName);
		/* add new user to room */
		const newUser = roomList.map((list) => {
			if (list.roomName === roomName && !list.users.includes(username)) {
				list.users.push(username);
			}
		});

		callback(roomList.find((rooms) => rooms.roomName === roomName));
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
