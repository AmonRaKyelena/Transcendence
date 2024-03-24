import { FC, useEffect, useState } from "react";
import IntraAuthBtn from "./IntraAuthBtn";
import './Auth.css'
import PasswordAuth from "./PasswordAuth";
import TwoFAAuth from "./TwoFAAuth";
import { useUserInfos } from "@/contexts/User/Component";

const Auth: FC = () => {
	const [twoFA, setTwoFA] = useState(false);
	const [userID, setUserID] = useState('');

	const userData = useUserInfos();

	useEffect(() => {
		if (userData.fetching.fetching)
			setTimeout(() => userData.setFetching({fetching: false}), 2000);
	}, [userData.fetching.fetching]);

	const goTo2FA = (userID: string) => {
		setTwoFA(true);
		setUserID(userID);
	}

	if(twoFA) {
		return (
			<div className="google-auth">
				<TwoFAAuth userID={userID} />
			</div>
		);
	}
	
	return (
		<div className="authPage">
			<div className="password_container">
				<PasswordAuth parentCallback={goTo2FA}/>
			</div>
			<div className="intra_btn_container">
				<IntraAuthBtn goTo2FA={goTo2FA}/>
			</div>
		</div>
	);
}

export default Auth