import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app'
import axios from 'axios';

function MyApp({ Component, pageProps }: AppProps) {
	const [token, setToken] = useState('');

	useEffect(() => {
		// Function to refresh the token
		const refreshToken = async () => {
			const url = '/api/auth/refreshJwt';
			await axios.get(url, {})
				.then(response => {
					setToken(response.data['token']);
					console.log('Jwt token has been refreshed');
				})
				.catch(error => {
					console.log(error);
				});
		};
		
		const intervalId = setInterval(refreshToken, 50 * 1000);

		return () => clearInterval(intervalId);
	}, []);

	return (
		<Component {...pageProps} />
	)
}

export default MyApp;