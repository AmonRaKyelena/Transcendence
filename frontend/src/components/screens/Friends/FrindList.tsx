import axios from 'axios';
import React, { useState, useEffect, FC } from 'react';
import './friendList.css'
import { UserData } from '@/contexts/User/FetchUserData';

export enum UserStatus {
    online = 'rgb(145, 238, 122)',   
	offline = 'rgb(139, 139, 139)',
    inGame = 'rgb(238, 122, 122)'
}

interface FriendListProps {
	callback: Function;
	update: number;
}

const FriendList: FC<FriendListProps> = ({callback, update}) => {
	const [friendsData, setFriendsData] = useState<UserData[]>([]);

	useEffect(() => {
		async function fetchLeaderboardData() {
			await axios.get('/api/user/friendList')
				.then(res => {
					const data = res.data;
					setFriendsData(data);
				})
				.catch(error => {
					console.log(error.message);
				});
		}

		fetchLeaderboardData();
	}, [update]);

	return (
		<div className='friend-list'>
			<div className='friendsl' style={friendsData.length > 0 ? {opacity: '1'} : {opacity: '0'}}>
				<ul>
					{friendsData.map((entry, index) => (
					<li key={index} onClick={(e) => callback(entry.username)}>
						<div className="img-area">
							<div className="inner-area">
								<img src={'api/user/profile-pictures/' + entry.profilePic} />
								<div className='status' style={{backgroundColor: UserStatus[entry.status as keyof typeof UserStatus]}}></div>
							</div>
						</div>
						<div className='username'>{entry.username}</div>
						<div className='friend-info'>
							<p className='score'>score: {entry.ranking}</p>
							<div><div className='win'>{entry.wins}</div> <div className='loose'>{entry.looses}</div></div>
						</div>
					</li>
					))}
				</ul>
			</div>
			
		</div>
	);
};

export default FriendList;