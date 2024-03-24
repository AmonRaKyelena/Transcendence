import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './leaderboard.css'

interface LeaderboardEntry {
	profilePic: string;
	username: string;
	ranking: number;
	wins: number;
	looses: number;
}

const Leaderboard: React.FC = () => {
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

	useEffect(() => {
		async function fetchLeaderboardData() {
			await axios.get('/api/user/leaderboard')
				.then(res => {
					const data = res.data;
					setLeaderboardData(data);
				})
				.catch(error => {
					console.log(error.message);
				});
		}

		fetchLeaderboardData();
	}, []);

	return (
		<div className='leaderboard'>
			<h1>Top 10</h1>
			<div className='leader-list' style={leaderboardData.length > 0 ? {opacity: '1'} : {opacity: '0'}}>
				<ul>
					{leaderboardData.map((entry, index) => (
					<li key={index}>
						<h2>{index + 1}</h2>
						<div className="img-area">
							<div className="inner-area">
								<img src={'api/user/profile-pictures/' + entry.profilePic} />
							</div>
						</div>
						<div className='username'>{entry.username}</div>
						<div className='leader-info'>
							<div><div className='win'>{entry.wins}</div> <div className='loose'>{entry.looses}</div></div>
						</div>
					</li>
					))}
				</ul>
			</div>
			
		</div>
	);
};

export default Leaderboard;