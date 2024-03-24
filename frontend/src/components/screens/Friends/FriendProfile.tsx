import { FC, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { UserData } from "@/contexts/User/FetchUserData";
import './friendProfile.css'
import axios from "axios";
import { useRouter } from "next/router";
import {useUserInfos} from "@/contexts/User/Component";
import {History} from "@/components/screens/Profile/Profile/UserProfile/UserProfile";

interface FriendProfileProps {
	friendData: UserData | null;
	callback: Function;
}

const FriendProfile: FC<FriendProfileProps> = ({friendData, callback}) => {
	const userName = useUserInfos().userName.userName;
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [isFriend, setIsFriend] = useState<boolean>(true);
	const [histories, setHistories] = useState<History[]>([]);

	const router = useRouter();

	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const username = queryParams.get('username');
		if (username) {
			callback(username);
		}
	}, []);

	function checkIsFriend() {
		if (friendData)
			handleIsFriend(friendData.username);
	}

	useEffect(() => {
		const checkBlocked = async () => {
			if (friendData)
				await axios.get('/api/user/isBlocked', {headers: {friendNick: friendData?.username}})
				.then(res => {
					if (!res.data) {
						console.log('Error');
					}
					if (res.data['success']) {
						setIsBlocked(true)
					} else {
						setIsBlocked(false);
					}
				})
		};

		checkBlocked();
		checkIsFriend();
		fetchHistory();
	}, [friendData]);

	const fetchHistory = async () => {
		if (friendData?.id) {
			await axios.get('/api/user/history', {headers: {id: friendData?.id}})
				.then(res => {
					setHistories(res.data);
				})
		}
	}

	const handleIsFriend = async (username: string) => {
		await axios.get('/api/user/isFriend/' + username)
		.then(res => {
			setIsFriend(res.data);
		})
		.catch(error => {
			console.log(error);
		})
	}

	const addFriend = async () => {
		await axios.get('/api/user/addFriend', {headers: {friendNick: friendData?.username}})
		.then(res => {
			callback(friendData?.username);
			setIsFriend(true);
		})
		.catch(error => {
			console.log(error);
		})
	}

	const toggleDropdown = (e: any) => {
		e.stopPropagation()
		setIsDropdownOpen(!isDropdownOpen);
	};

	const hideDropdown = () => {
		setIsDropdownOpen(false);
	};

	const deleteFriend = async () => {
		await axios.get('/api/user/deleteFriend', {headers: {friendNick: friendData?.username}})
		.then(res => {
			callback(friendData?.username);
			setIsFriend(false);
		})
	}

	const sendMessage = async () => {
		let chatName = [friendData?.username, userName].sort().join('-');
		router.push('/chat?chat=' + chatName);
	}

	function unblockUser() {
		axios.get('/api/user/unblockUser', {headers: {friendNick: friendData?.username}})
		.then(res => {
			setIsBlocked(false);
			setIsFriend(false);
		})
	}

	if (isBlocked) {
		return (
			<div className="friendProfilePage" onClick={hideDropdown}>
				<div>
					This user is blocked
				</div>
				<button className="btn" onClick={unblockUser} >unblock</button>
			</div>
		)
	}

	return (
		<div className="friendProfilePage" onClick={hideDropdown}>
			<div className='openEffect' style={!!friendData ? {opacity: '1'} : {opacity: '0'}}>
				{isFriend ? (
					<div className="icon dots" onClick={toggleDropdown}><FontAwesomeIcon icon={faEllipsisV}
																						 className="i"/></div>
				) : (
					<div className="icon dots" onClick={addFriend}><FontAwesomeIcon icon={faUserPlus} className="i"
																					title="Add friend"/></div>
				)}
				<div className="dropdown">
					{isDropdownOpen && (
						<div className="dropdown-menu">
							<div className="dropdown-item" onClick={sendMessage}>Send message</div>
							<div className="dropdown-item" onClick={deleteFriend}>Delete from friends</div>
						</div>
					)}
				</div>

				<div className="img-area">
					<div className="inner-area">
						<img src={friendData ? '/api/user/profile-pictures/' + friendData.profilePic : ''} alt=""></img>
					</div>
				</div>
				<div className="username">{friendData?.username}</div>

				<div className="fullName">{friendData?.first_name} {friendData?.last_name}</div>
				<div style={{fontSize: '10px'}}>wins: <div className='win'>{friendData?.wins}</div> loose: <div
					className='loose'>{friendData?.looses}</div></div>
				<div style={{fontSize: '10px'}}>rank {friendData?.ranking}</div>
			</div>
			<div className="games_history">
				{histories.map((entry, index) => (
					<li key={index}>
						<div className="date">{new Date(entry.finishedAt).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'})}</div>
						<div className='username'>{friendData?.username}</div>
						<div className="result">
							<div className="result_count">{entry.userScore}:{entry.opponentScore}</div>
						</div>
						<div className='username'>{entry.opponentUsername}</div>
					</li>
				))}
			</div>
		</div>
	);
}

export default FriendProfile
