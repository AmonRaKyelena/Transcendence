import { FC, useEffect } from 'react';
import '../styles/navbar.css'
import '../styles/globals.css'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';

const Navbar: FC = () => {
	const [navbar, setNavbar] = useState(false);
	const [username, setUsername] = useState('');
	const router = useRouter();

	useEffect(() => {
		// Function to fetch the access token
		const fetchUsername = async () => {
			const url = '/api/user/username';
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"content-type": "application/json",
				},
			}).catch((e) => console.log(e));
			if (response?.ok)
				setUsername((await response.json())['username']);
		};
	
		// Call the fetchAccessToken function when the component mounts
		fetchUsername();
	  }, []);

	const goToProfilePage = () => {
		if (username)
			router.push('/profile');
	}

	return (
		<nav className='nav'>
			<div className="nav_content">
				<div>
					<div className="nav_sections">
						{/* LOGO */}
						<Link href='/' className='logo'>
							<Image
								src="/pong_logo.svg"
								width={50}
								height={50}
								alt='logo' />
								<h2> Transcendence</h2>
						</Link>

						{/* BURGER BUTTON FOR MOBILE */}
						<div className="burger">
							<button onClick={() => {setNavbar(!navbar)}}>
								{navbar ? (
									<Image
										src="/close.png"
										width={30}
										height={30}
										alt='logo'/>
								) : (
									<Image
										src="/burger_menu.png"
										width={30}
										height={30}
										alt='logo'
										className='burger_btm_img'
									/>
								)}
							</button>
						</div>
					</div>
				</div>
				<div className={`tabs ${navbar ? 'tabs_open' : 'hidden_mini'}`}>
					<ul>
						<li>
							<Link href='/profile' onClick={() => setNavbar(!navbar)}>
								Profile
							</Link>
						</li>
						<li>
							<Link href='/game' onClick={() => setNavbar(!navbar)}>
								Game
							</Link>
						</li>
						<li>
							<Link href='/chat' onClick={() => setNavbar(!navbar)}>
								Chat
							</Link>
						</li>
						<li>
							<Link href='/about' onClick={() => setNavbar(!navbar)}>
								About
							</Link>
						</li>
					</ul>
				</div>

				{/* USERNAME */}
				<div className="username" onClick={goToProfilePage}>
					<h2>{username}</h2>
				</div>
			</div>
		</nav>
	);
}

export default Navbar