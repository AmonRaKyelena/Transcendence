import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './chatManager.css'
import { useUserInfos } from '@/contexts/User/Component';
import ChatCreate from './ChatCreate';
import SearchChat from './SearchChat';
import ChatList from './ChatList';

interface ChatManagerProps {
	callback: Function;
}

export interface ChatDto {
	name: string;
}

const ChatManager: React.FC<ChatManagerProps> = ({callback}) => {
	const [activeChats, setActiveChats] = useState<ChatDto[]>([]);
	const [joinableChats, setJoinableChats] = useState<ChatDto[]>([]);
	const [chatsFiltration, setChatsFiltration] = useState(false);

	const username: string = useUserInfos().userName.userName;

	const [isOpen_chatCreate, setIsOpen_chatCreate] = useState(false);
	const handleOpenClick_chatCreate = () => {
		setIsOpen_chatCreate(!isOpen_chatCreate);
	};

	useEffect(() => {
		async function fetchUserChats() {
			await axios.get('/api/chat/user/' + username)
			.then(res => {
				const data = res.data;
				setActiveChats(data);
			})
			.catch(error => {
				console.log(error.message);
			});
		}

		fetchUserChats();
	}, []);


	return (
		<div className='chat-manager'>
			<h1 style={{margin: '0 auto'}}>Chats</h1>

			<button className='create_btn' onClick={handleOpenClick_chatCreate}>New chat</button>
			{isOpen_chatCreate ? (
				<ChatCreate closeWindow={(chatName: string) => {setIsOpen_chatCreate(false); callback(chatName)}}/>
			) : (
				<>
				<SearchChat setJoinable={setJoinableChats} setActive={setActiveChats} setFiltration={setChatsFiltration}/>
				<ChatList callback={callback} chats={activeChats} filtring={chatsFiltration}/>
				{chatsFiltration && (<><hr></hr><h3 className='global-search'>Global search</h3></>)}
				<ChatList callback={callback} chats={joinableChats} filtring={chatsFiltration}/>
				</>
			)}
		</div>
	);
};

export default ChatManager;