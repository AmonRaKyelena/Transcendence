import { FC } from "react"
import Image from 'next/image';
import { useUserInfos } from "@/contexts/User/Component";

const PageLoading: FC = () => {
	const show = useUserInfos().fetching.fetching;

	if (!show) 
		return (<></>);

	return (
		<div className="loading">
			<h2 style={{marginBottom: '10px'}}>Loading...</h2>
			<Image
				src="/loading-gif.gif"
				width={30}
				height={30}
				alt='logo' 
				priority={true}
			/>
		</div>
	);}

export default PageLoading