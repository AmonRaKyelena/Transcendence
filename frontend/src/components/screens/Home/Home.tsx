import { FC } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import './Home.css'

const Home: FC = () => {
	return (
		<div className="homePage">
			<Navbar />
			<main>
				<span>There's going to be something beautiful here </span>
				<br/>
				<span>		I hope.....</span>
				<Image
					src='/zxc_cat.gif'
					width={500}
					height={500}
					alt="cat"	
				/>
			</main>
		</div>
	);
}

export default Home