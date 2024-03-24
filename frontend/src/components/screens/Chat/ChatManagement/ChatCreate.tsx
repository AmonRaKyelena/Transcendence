import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './chatCreate.css'
import { useUserInfos } from '@/contexts/User/Component';

interface ChatListProps {
	closeWindow: Function;
}

const ChatCreate: React.FC<ChatListProps> = ({closeWindow}) => {
	const userData = useUserInfos();

	const [isChecked_PublicChat, setIsChecked_PublicChat] = useState<boolean>(false);
	const [isChecked_PrivateChat, setIsChecked_PrivateChat] = useState<boolean>(false);
	const [chatName, setChatName] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState<string>('');
 
	const handlePublicClick = () => {
		setIsChecked_PublicChat(!isChecked_PublicChat);
		setIsChecked_PrivateChat(!setIsChecked_PrivateChat);
	};

	const handlePrivateClick = () => {
		setIsChecked_PrivateChat(!isChecked_PrivateChat);
		setIsChecked_PublicChat(!setIsChecked_PublicChat);
	};

	const createChat = async () => {
		setError('');
		if (!chatName) {
			setError('Empty chat name!');
			return;
		} else if (!isChecked_PrivateChat && !isChecked_PublicChat) {
			setError('You need to choose privacy option!');
			return;
		} else if (isChecked_PrivateChat && !password) {
			setError('You need to create a password!');
			return;
		} else if (chatName.length < 3) {
			setError('Chat name is too short!');
			return;
		} else if (isChecked_PrivateChat && password.length < 3) {
			setError('Password is too short!');
			return;
		}

		const url = '/api/chat/create';
		const headers = {
			'Content-Type': 'application/json',
		};
		const newChat = { 
			name: chatName,
			private: isChecked_PrivateChat,
			password: password,
			owner: userData.userName.userName,
			group: true
		}
		await axios.post(url, newChat, { headers })
		.then(res => {
			if (res.data['error']) {
				setError(res.data['error']);
				return;
			}
			closeWindow(newChat.name);
		})
		.catch(error => {
			console.log('error');
		})
	}


	return (
		<div className='create-chat'>
			<div className="chat-name-panel">
				<input type='text'
						id="chat-input"
						placeholder="Name of your new chat"
						value={chatName}
						onChange={(e) => setChatName(e.target.value)}>
				</input>
			</div>

			<div className='privacy-options'>
				<div className={isChecked_PublicChat ? "privacy-option checked" : "privacy-option"} onClick={handlePublicClick}>
					Public Chat
				</div>

				<div className={isChecked_PrivateChat ? "privacy-option checked" : "privacy-option"} onClick={handlePrivateClick}>
					Private Chat
				</div>
			</div>

			<div className='password-and-create'>
				{isChecked_PrivateChat ? 
				<div style={{marginRight: '25px'}}>
					<input type='text'
							id="chat-input"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
					>
					</input>
				</div>
				: <></>}

				<button className='create_chat_finish_btn' onClick={createChat}>Create!</button>
			</div>

			<span className='invalid-feedback'>{error}</span>
		</div>
	);
};

export default ChatCreate;