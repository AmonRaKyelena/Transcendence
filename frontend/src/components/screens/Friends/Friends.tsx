import { FC, useEffect, useState } from "react";
import "./friends.css"
import FriendList from "./FrindList";
import { useUserInfos } from "@/contexts/User/Component";
import GoToAuth from "@/components/common/auth/GoToAuth";
import { UserData } from "@/contexts/User/FetchUserData";
import axios from "axios";
import FriendProfile from "./FriendProfile";
import SearchFriend from "./SearchFriend";
import PageLoading from "../../common/PageLoading";

const Friends: FC = () => {
	const [friendData, setFriendData] = useState<UserData | null>(null);
	const [update, setUpdate] = useState(0);

	const loading = useUserInfos().fetching.fetching;
	const logged = useUserInfos().logged.logged;

	const userData = useUserInfos();

	useEffect(() => {
		if (userData.fetching.fetching)
			setTimeout(() => userData.setFetching({fetching: false}), 1000);
	}, [userData.fetching.fetching]);

	const handleClientChoose = async (username: string) => {
		await axios.get('/api/user/friendsData', {headers: {username: username}})
		.then(res => {
			setFriendData(res.data);
			setUpdate((prevUpdate) => prevUpdate + 1);
		})
		.catch(error => {
			console.log(error);
		})
	}

	if (loading) {
		return (
			<div className="friends">
				<div style={{height: '39px'}}></div>
				<div className='back'>
					<PageLoading/>
				</div>
			</div>
		);
	}

	if (!logged) {
		return (
			<div className="friends">
				<div style={{height: '39px'}}></div>
				<div className='back'>
					<GoToAuth/>
				</div>
			</div>
		)
	}

	return (
		<div className="friends">
			<div style={{height: '39px'}}></div>
			<div className='back'>
				<div className="friends-list">
					<h1>Friends</h1>
					<SearchFriend callback={handleClientChoose}/>
					<FriendList callback={handleClientChoose} update={update}/>
				</div>

				<div className='friends_separation_line'></div>

				<div className='friend'>
					<FriendProfile friendData={friendData}  callback={handleClientChoose}/>
				</div>
			</div>
		</div>
	);
}

export default Friends