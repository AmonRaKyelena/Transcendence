import { useUserInfos } from "@/contexts/User/Component";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import './searchChat.css'
import { useDebounce } from "@/hooks/useDebounce";

interface SearchChatProps {
	setJoinable: Function;
	setActive: Function;
	setFiltration: Function;
}

interface Chat {
	name: string;
}

const SearchChat: FC<SearchChatProps> = ({setJoinable, setActive, setFiltration}) => {
	const [chatName, setChatName] = useState('');

	const debouncedName = useDebounce(chatName)

	const username: string = useUserInfos().userName.userName;

	useEffect(() => {
		const makeChatRequest = async (url: string, setter: Function) => {
			await axios.get(url, {params: {userName: username}})
			.then(res => {
				var data: Chat[] = res.data;
				data = data.filter((chat) => chat.name.startsWith(debouncedName));
				setter(data);
			})
			.catch(error => {
				console.log(error.message);
			});
		}

		const search = async () => {
			if (debouncedName) {
				await makeChatRequest('/api/chat/joinableChats', setJoinable);
				setFiltration(true);
			} else {
				setJoinable([]);
				setFiltration(false);
			}

			await makeChatRequest('/api/chat/user/' + username, setActive);
		}

		search();
	}, [debouncedName])

	return (
		<div className="search-panel">
			<input type='text'
					id="search-input"
					placeholder="Search chats"
					value={chatName}
					onChange={(e) => setChatName(e.target.value)}>
			</input>
			
		</div>
	)
}

export default SearchChat