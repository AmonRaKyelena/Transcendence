import { FC, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import './Profile.css'
import { useRouter } from "next/router";

interface UserData {
    username: string,
    first_name: string | null,
    last_name: string | null,
	status: string
}

const Profile: FC = () => {
	const [userData, setUserData] = useState<UserData | null>(null);
	const router = useRouter();

	useEffect(() => {
		const refreshToken = async () => {
			const url = '/api/auth/refreshJwt';
			await axios.get(url, {})
				.then(response => {
					console.log('Jwt token has been refreshed');
				})
				.catch(error => {
					console.log(error);
				});
		};
		// Function to fetch the user data
		const fetchUserData = async () => {
			await refreshToken();
			await axios.get('/api/user/userData')
				.then(response => {
					const data = response.data;

					if (data && typeof data === 'object') {
						setUserData(data);
					} else {
						console.error('Invalid user data received:', data);
					}
				})
				.catch(error => {
					router.push('/auth');
				});
		};
		
		// Call function when the component mounts
		fetchUserData();
	}, []); // Empty dependencies - runs on mount

	
	if (!userData) {
		return (
			<div className="profilePage">
				<Navbar />
				<main>
					<p>Loading user data...</p>
				</main>
			</div>
		);
	}

	const logout = async () => {
		await axios.get('/api/auth/logout');
		router.push('/');
	}
	
	return (
		<div className="profilePage">
			<Navbar />
			<main>
				<div>
					<p>Hello, {userData.username}</p>
					<p>You're {userData.status}</p>
					<p>.....Or should i call you {userData.first_name} {userData.last_name}?</p>
				</div>
				<button onClick={logout}>
					Log Out
				</button>
			</main>
		</div>
	);
}

export default Profile