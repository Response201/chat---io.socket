import { Message } from "./Message";
import { User } from "./User";

export type Room = {
	id: string;
	roomName: string;
	messages: Message[];
	users: User[];
};
