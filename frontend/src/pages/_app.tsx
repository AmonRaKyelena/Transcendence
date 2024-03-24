import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app'
import axios from 'axios';
import Head from 'next/head';
import Navbar from "@/components/Navbar";
import { UserContextProvider } from '@/contexts/User/Component';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
	const [token, setToken] = useState('');

	useEffect(() => {
		const refreshToken = async () => {
			const url = '/api/auth/refreshJwt';
			await axios.get(url, {})
				.then(response => {
					setToken(response.data['token']);
				})
				.catch(error => {
					console.log(error);
				});
		};
		
		const intervalId = setInterval(refreshToken, 50 * 1000);

		return () => clearInterval(intervalId);
	}, []);

	return (
		<UserContextProvider>
			<div className='pageContainer'>
				<Head>
					<link rel="icon" href="/pong_logo.svg" />
					<title>Transcendence</title>
				</Head>
				<Navbar/>
				<Component {...pageProps} />
			</div>
		</UserContextProvider>
	)
}

export default MyApp;