import axios from 'axios';

export interface UserData {
	id:				string,
    username: 		string,
    first_name: 	string | null,
    last_name: 		string | null,
	status: 		string,
	profilePic: 	string,
	twoFAEnabled: 	boolean,
	ranking:		number,
	wins:			number,
	looses:			number
}

const fetchUserData = async (): Promise<UserData | null> => {
	const url = '/api/auth/refreshJwt';
	const res = await axios.get(url, {})
		.then(response => {
			if (response.data['res'] != 'Success')
				return false;
			return true;
		})
		.catch(error => {
			console.log(error);
			return false;
		});
	
	if (!res)
		return null;
	

	const data: UserData | null = await axios.get('/api/user/userData')
		.then (response => {
			return response.data;
		})
		.catch( error => {
			console.log(error);
			return null;
		});

	if (!data)
		return null;

	data.profilePic = '/api/user/profile-pictures/' + data.profilePic;
	return data;
};

export default fetchUserData;