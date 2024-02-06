import { FC, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import IntraAuthBtn from "@/components/IntraAuthBtn";
import './Auth.css'
import { useRouter } from "next/router";

const Auth: FC = () => {
	const [isAuthorized, setIsAuthorized] = useState(false);
	const router = useRouter();

	useEffect(() => {
	  // Function to fetch the access token
		const fetchJWTToken = async () => {
			const response = await fetch("/api/auth/checkJWT", {
				method: "GET",
				headers: {
					"content-type": "application/json",
				},
			}).catch((e) => console.log(e));
			if (response?.ok)
				router.push('/profile');

			// Check if 'code' is present in the query string
			const queryParams = new URLSearchParams(window.location.search);
			const code = queryParams.get('code');
			
			if (code) {
				setIsAuthorized(true);
				const url = '/api/auth/loginIntra';
				const headers = {
					'Content-Type': 'application/json',
					Code: code,
				};
				await axios.post(url, {}, { headers })
					.then(response => {
						console.log('User authorised');
						router.push('/profile');
					})
					.catch(error => {
						console.error(error);			
					});
			}
		};
  
	  // Call the fetchAccessToken function when the component mounts
	  fetchJWTToken();
	}, []); // Empty dependency array ensures this effect runs only once when the component mounts

	if (!isAuthorized) {
		return (
			<div className="authPage">
				<Navbar />
				<IntraAuthBtn />
			</div>
		);
	} else {
		return (
			<div className="authPage">
				<Navbar />
				<main>Loading...</main>
			</div>
		);
	}
}

export default Auth