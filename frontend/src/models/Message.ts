import { User } from "./User";

export interface Message {
	message: string;
	cratedAt: string;
	room: string /* vilket rum meddelandet ska synas i */;
	user: User;
}
