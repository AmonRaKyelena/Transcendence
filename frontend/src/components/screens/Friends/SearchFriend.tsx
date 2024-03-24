import axios from "axios";
import { FC, useState } from "react"

interface SearchFriendProps {
	callback: Function;
}

const SearchFriend: FC<SearchFriendProps> = ({callback}) => {
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [friendNick, setFriendNick] = useState('');

	const handleChange = (event: any) => {
		setFriendNick(event.target.value);
	}

	const handleEnter = async (event: any) => {
		if (event.key === 'Enter') {
			if (friendNick.length < 5) {
				setError('Wrong nickname!')
				setTimeout(() => setError(''), 1500);
				return ;
			}
			await axios.get('/api/user/addFriend', {headers: {friendNick: friendNick}})
				.then(res => {
					if (res.data['error']) {
						setError(res.data['error']);
						setTimeout(() => setError(''), 1500);
						return;
					}

					setError('');
					setSuccess(res.data['success']);
					setTimeout(() => setSuccess(''), 1500);
					callback(friendNick);
				})
		}
	}

	return (
		<div className='search'>
			<div className="search-panel">
				<input type='text' id="search-input" placeholder="Search friends" value={friendNick} onChange={handleChange} onKeyDown={handleEnter}></input>
			</div>
			<div className="invalid-feedback" style={error ? {} : {opacity: '0'}}>{error}</div>
			<div className="success-feedback" style={success ? {} : {opacity: '0'}}>{success}</div>
		</div>
	)
}

export default SearchFriend