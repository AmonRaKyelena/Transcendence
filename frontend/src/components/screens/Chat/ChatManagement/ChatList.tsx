import { FC } from "react";
import { ChatDto } from "./ChatManager";
import './chatList.css'

interface ChatListProps {
	callback: Function;
	chats: ChatDto[];
	filtring: boolean;
}

const ChatList: FC<ChatListProps> = ({callback, chats, filtring}) => {
	return (
		<>
		{chats.length > 0 ? (
			<div style={{ width: '100%', padding: '10px', overflowY: 'auto', paddingTop: '0', marginTop: '10px'}} className="chat-list">
				<ul>
					{chats.map((entry: any, index) => (
					<li key={index} onClick={(e) => callback(entry.name)}>
						<div className="img-area">
							<div className="inner-area">
								<img src={'default.jpg'} />
							</div>
						</div>

						<div className='chat-info'>
							<div className='username'>{entry.name}</div>
						</div>
					</li>
					))}
				</ul>
			</div> )
		: filtring ? (
			<h3 style={{marginTop: '15px', marginLeft: '10px'}}>No chats found</h3>
		) : (
			<></>
		)}
		</>
	);
}

export default ChatList;