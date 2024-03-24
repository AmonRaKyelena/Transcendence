import axios from "axios";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import '@/styles/profile/enable2FA.css';

interface Enable2FAProps {
	qrCode: string,
	userID: string,
	backToProfile: () => void;
}

const Enable2FA: FC<Enable2FAProps> = ({qrCode, userID, backToProfile}) => {
	const [googleCode, setGoogleCode] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	const handleChangeCode = (event: any) => {
		setGoogleCode(event.target.value);
	}
	
	const handleVerifyButton = async (e: any) => {
		e.preventDefault();

		if (googleCode.length != 6) {
			setError('Code length must be 6');
			return ;
		}

		const headers = {
			'Content-Type': 'application/json',
		};
		await axios.post('/api/auth/validate2FA', {code: googleCode, userID: userID}, { headers })
			.then(async (response) => {
				if (response.data === 'Authorized') {
					await axios.get('/api/user/enable2FA');
					router.push('/profile')
				} else {
					setError('Wrong code, try again!');
				}
			})
			.catch(error => {
				console.log(error.message);		
			});
	}


	return (
		<div className='enable-google' style={{display: 'flex', alignContent: 'center', flexDirection: 'column'}}>
			<h3>Please, scan this QR code with app</h3>
			<img src={qrCode}></img>
			<div className="google-auth">
				<label>Enter google verification code:</label>
				<input type="text" name="googleCode" value={googleCode} onChange={handleChangeCode}/>
				<div className="invalid-feedback" style={{color: 'red'}}>{error}</div>
				<button onClick={handleVerifyButton}>
					Authorize
				</button>
				<button onClick={backToProfile}>
					Back
				</button>
			</div>
		</div>
	);
}

export default Enable2FA