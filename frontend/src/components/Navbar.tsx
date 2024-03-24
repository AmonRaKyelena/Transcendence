import { FC, useEffect } from 'react';
import '../styles/navbar.css'
import '../styles/globals.css'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUserInfos } from '@/contexts/User/Component';

const Navbar: FC = () => {
	const [navbar, setNavbar] = useState(false);
	
	const router = useRouter();
	const userData = useUserInfos();


	const goToProfilePage = () => {
		if (userData)
			router.push('/');
	}

	return (
		<nav className='nav' style={{background: "#1F1F1F", fontFamily: "Roboto"}}>
			<div className="nav_content">
				<div>
					<div className="nav_sections">
						<Image
							src="/pong_logo.svg"
							width={50}
							height={50}
							alt='logo' 
							priority={true}
						/>
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
							<Link href='/' onClick={() => setNavbar(!navbar)}>
								HOME
							</Link>
						</li>
						<li>
							<Link href='/game' onClick={() => setNavbar(!navbar)}>
								GAME
							</Link>
						</li>
						<li>
							<Link href='/chat' onClick={() => setNavbar(!navbar)}>
								CHAT
							</Link>
						</li>
						<li>
							<Link href='/friends' onClick={() => setNavbar(!navbar)}>
								FRIENDS
							</Link>
						</li>
					</ul>
				</div>
				<div className="username" onClick={goToProfilePage}>
					<span>{userData.userName.userName}</span>
				</div>
			</div>
		</nav>
	);
}

export default Navbar