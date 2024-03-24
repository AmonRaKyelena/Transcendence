import { FC, useEffect, useState } from "react"
import '@/styles/auth/twoFAAuth.css'
import axios from "axios";
import { useUserInfos } from "@/contexts/User/Component";

interface TwoFAAuthProps {
	userID: string;
}

const TwoFAAuth: FC<TwoFAAuthProps> = (props) => {
	const [googleCode, setGoogleCode] = useState('');
	const [error, setError] = useState('');

	const userData = useUserInfos();

	const handleChangeCode = (event: any) => {
		setGoogleCode(event.target.value);
	}
	
	const handleVerifyButton = async (e: any) => {
		e.preventDefault();

		if (googleCode.length != 6) {
			setError('Code length must be 6');
			return ;
		}
		console.log("validating 2fa with userID: " + props.userID)
		const url = '/api/auth/validate2FA';
		const headers = {
			'Content-Type': 'application/json',
		};
		await axios.post(url, {code: googleCode, userID: props.userID}, { headers })
			.then(response => {
				if (response.data === 'Authorized') {
					userData.fetchData(prev => (prev + 1));
				} else {
					setError('Wrong code, try again!');	
				}
			})
			.catch(error => console.log(error.message));
	}

	return (
		<div className="google-2fa">
			<label>Enter google verification code:</label>
			<input type="text" name="googleCode" value={googleCode} onChange={handleChangeCode}/>
			<div className="invalid-feedback" style={{color: 'red'}}>{error}</div>
			<button onClick={handleVerifyButton}>
				Authorize
			</button>
		</div>
	);
}

export default TwoFAAuth