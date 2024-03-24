import { FC, useEffect, useState  } from "react";
import { ChatUser } from "./Messenger";
import axios from "axios";

interface ChatAdminDropdownProps {
	goToProfile: Function;
	block: Function;
	unblock: Function;
	isBlocked: boolean;
	entry: ChatUser;
	chatName: string | null;
	refresh: React.Dispatch<React.SetStateAction<number>>;
}

enum UserStatusChange {
	mute = 'mute',
	unmute = 'unmute',
	setadmin = 'setadmin',
	unsetadmin = 'unsetadmin'
}

const ChatAdminDropdown: FC<ChatAdminDropdownProps> = ({goToProfile, block, unblock, isBlocked, entry, chatName, refresh}) => {
	const changeRights = async (username: string, newStatus: UserStatusChange) => {
		await axios.patch('api/chat/' + chatName + '/changeRights/' + username + '?newStatus=' + newStatus)
		.then(res => {
			refresh((r) => r + 1);
		})
		.catch(err => {
			console.log(err);
		})
	}

	function kickUser(username: string) {
		axios.patch('api/chat/' + chatName + '/kick/' + username)
		.then(res => {
			refresh((r) => r + 1);
		})
		.catch(err => {
			console.log(err);
		})
	}

	return (
		<div className="dropdown_menu_chat">
			<div className="item" onClick={e => goToProfile(entry.user.username)}>profile</div>
			{!isBlocked ? (<div className="item" onClick={e => block(entry.user.username)}>block</div>)
				: (<div className="item" onClick={e => unblock(entry.user.username)}>unblock</div>)}
			{!entry.admin ?
			(<div className="item"
					onClick={e => changeRights(entry.user.username, UserStatusChange.setadmin)}>
				set as administrator
			</div>
			) : (
			<div className="item"
					onClick={e => changeRights(entry.user.username, UserStatusChange.unsetadmin)}>
				delete from administrators
			</div>
			)}
			<div className="item" onClick={e => kickUser(entry.user.username)}>kick</div>
			{!entry.muted ? (
			<div className="item"
					onClick={e => changeRights(entry.user.username, UserStatusChange.mute)}>
				mute
			</div>
			) : (
				<div className="item"
				onClick={e => changeRights(entry.user.username, UserStatusChange.unmute)}>
				unmute
			</div>
			)}
		</div>
	);
}

export default ChatAdminDropdown