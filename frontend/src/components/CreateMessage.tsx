import React, { ChangeEvent } from "react";
import { FaRegPaperPlane } from "react-icons/fa6";

interface Props {
	PostMessage: () => void;
	newMessage: string;
	setNewMessage: (newMessage: string) => void;
}

export const CreateMessage = ({
	PostMessage,
	newMessage,
	setNewMessage,
}: Props) => {
	return (
		<>
			<div className="messageInputAndBtnContainer">
				<section className="messageInputAndBtn">
					<input
						className="newMessageInput"
						placeholder="Skicka ett meddelande"
						maxLength={50}
						minLength={3}
						value={newMessage}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setNewMessage(e.target.value)
						}
					></input>
					<button onClick={PostMessage}>
						<div className="iconBtn">
							{" "}
							<FaRegPaperPlane />{" "}
						</div>
					</button>
				</section>
			</div>
		</>
	);
};
