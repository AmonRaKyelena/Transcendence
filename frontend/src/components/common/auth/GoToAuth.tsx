import { useRouter } from "next/router";
import { FC } from "react"
import '@/styles/auth/goToAuth.css'

/*
* This component is used to block page if the user isn't logged in.
* Has button to send user to authorization page.
*/
const GoToAuth: FC = () => {
	const router = useRouter();

	return (
		<div className="goToAuth">
			<h2>You need to authorize before accessing this page!</h2>
			<button onClick={(e) => router.push('/')}>Go to authorization</button>
		</div>
	);}

export default GoToAuth