import axios from "axios";
import { FC, useState } from "react";
import '@/styles/auth/passAuth.css'
import { useRouter } from "next/router";
import { useUserInfos } from "@/contexts/User/Component";

interface PassAuthProps {
	parentCallback: Function;
}


const PasswordAuth: FC<PassAuthProps> = (props) => {
	const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [error, setError] = useState('');

	const userData = useUserInfos();

	const router = useRouter();

	const handleChangePass = (event: any) => {
		setPassword(event.target.value);
	}

	const handleChangeLogin = (event: any) => {
		setUsername(event.target.value);
	}

	const handleChangeFirstName = (event: any) => {
		setFirstName(event.target.value);
	}

	const handleChangeLastName = (event: any) => {
		setLastName(event.target.value);
	}

	const toggleForm = () => {
		setIsLoginFormVisible((prevValue) => !prevValue);
		setError('');
	};

	const logIn = async (e: any) => {
		e.preventDefault();

		if (username.length < 5) {
			setError('Login too short(5+ letters required)!');
			return ;
		} else if (password.length < 3) { 
			setError('Password too short(3+ letters required)!');
			return ;
		}

		const url = '/api/auth/loginPass';
		const headers = {
			'Content-Type': 'application/json',
		};
		await axios.post(url, {password: password, username: username}, { headers })
			.then(response => {
				if (response.data['need2FA'])
					props.parentCallback(response.data['userID']);
				else
				userData.setFetching({fetching: true});
				userData.fetchData(prev => (prev + 1));
			})
			.catch(error => {
				setError('Wrong username or password!');			
			});
	}

	const signUp = async (e: any) => {
		e.preventDefault();

		if (username.length < 5) {
			setError('Login too short(5+ letters required)!');
			return ;
		} else if (username.length > 15) {
			setError('Login too long!');
			return ;
		} else if (password.length < 3) { 
			setError('Password too short(3+ letters required)!');
			return ;
		} else if (firstName.length < 3) { 
			setError('First name too short(3+ letters required)!');
			return ;
		} else if (firstName.length > 15) {
			setError('First name too long!');
			return ;
		} else if (lastName.length < 3) { 
			setError('Last name too short(3+ letters required)!');
			return ;
		} else if (lastName.length > 15) {
			setError('Last name too long!');
			return ;
		}
		
		const url = '/api/auth/signUpPass';
		const headers = {
			'Content-Type': 'application/json',
		};
		const content = {
			password: password,
			username: username,
			first_name: firstName,
			last_name: lastName
		}

		await axios.post(url, content, { headers })
			.then(response => {
				console.log('User registered');
				setIsLoginFormVisible(true);
			})
			.catch(error => {
				setError(error.response.data['message']);			
			});
	}

	return (
		<div className="card">
			{ isLoginFormVisible ? (
				<form className="login-form">
					<h1 className="card-header">Login</h1>
					<input type="text" name="username" value={username} placeholder="username" onChange={handleChangeLogin}/>
					<input type="password" name="password" value={password} placeholder="password" onChange={handleChangePass}/>
					
					<button onClick={logIn}>Login</button>
					<div className="invalid-feedback">{error}</div>
					<p className="registration-message">Not registered? <a href="#" onClick={toggleForm}>Create an account</a></p>				
				</form>
			) : (
				<form className="register-form">
					<h1 className="card-header">Sign up</h1>
					<input type="text" name="firstName" value={firstName} placeholder="first name" onChange={handleChangeFirstName}/>
					<input type="text" name="lastName" value={lastName} placeholder="last name" onChange={handleChangeLastName}/>
					<input type="text" name="username" value={username} placeholder="username" onChange={handleChangeLogin}/>
					<input type="password" name="password" value={password} placeholder="password" onChange={handleChangePass}/>

					<button onClick={signUp}>Sign up</button>
					<div className="invalid-feedback">{error}</div>
					<p className="registration-message">Already registered? <a href="#" onClick={toggleForm}>Go to login</a></p>
				</form>
			)}
		</div>
	);
}

export default PasswordAuth