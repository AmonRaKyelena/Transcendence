import { FC, useEffect, useState } from "react";
import "./profile.css"
import Auth from "./Profile/Auth/Auth";
import UserProfile from "./Profile/UserProfile/UserProfile";
import Leaderboard from "./Leaderboard/LeaderBoard";
import { useUserInfos } from "@/contexts/User/Component";
import AuthHandler from "./Profile/AuthHandler";

const Profile: FC = () => {
	return (
		<div className="profile">
			<div style={{height: '39px'}}></div>
			<div className='back'>
				<div className="leader_board">
					<Leaderboard />
				</div>

				<div className='profile_separation_line'></div>
				
				<AuthHandler />
				
			</div>
		</div>
	);
}

export default Profile