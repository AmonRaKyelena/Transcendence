import { createContext, useContext, useEffect, useState } from 'react';
import fetchUserData from './FetchUserData';

type UserContextProviderProps = {
	children: React.ReactNode;
};

export type UserId = {
	userId: string;
};

export type UserName = {
	userName: string;
};

export type FirstName = {
	firstName: string;
};

export type LastName = {
	lastName: string;
};

export type Status = {
	status: string;
}

export type AuthImage = {
	image: string;
};

export type DoubleAuthVerified = {
	verified2FA: boolean;
};

export type DoubleAuth = {
	doubleAuth: boolean;
};

export type Ranking = {
	ranking: number;
}

export type Logged = {
	logged: boolean;
}

export type Fetching = {
	fetching: boolean;
}

export type Wins = {
	wins: number;
}

export type Looses = {
	looses: number;
}

export type UserContextType = {
	userId: UserId;
	setUserId: React.Dispatch<React.SetStateAction<UserId>>;
	userName: UserName;
	setUserName: React.Dispatch<React.SetStateAction<UserName>>;
	firstName: FirstName;
	setFirstName: React.Dispatch<React.SetStateAction<FirstName>>;
	lastName: LastName;
	setLastName: React.Dispatch<React.SetStateAction<LastName>>;
	status: Status;
	setStatus: React.Dispatch<React.SetStateAction<Status>>;
	image: AuthImage;
	setImage: React.Dispatch<React.SetStateAction<AuthImage>>;
	doubleAuth: DoubleAuth;
	setDoubleAuth: React.Dispatch<React.SetStateAction<DoubleAuth>>;
	verified2FA: DoubleAuthVerified;
	setVerified2FA: React.Dispatch<React.SetStateAction<DoubleAuthVerified>>;
	ranking: Ranking;
	setRanking: React.Dispatch<React.SetStateAction<Ranking>>;
	logged: Logged;
	setLogged: React.Dispatch<React.SetStateAction<Logged>>;
	fetching: Fetching;
	setFetching: React.Dispatch<React.SetStateAction<Fetching>>;
	wins: Wins;
	setWins: React.Dispatch<React.SetStateAction<Wins>>;
	looses: Looses;
	setLooses: React.Dispatch<React.SetStateAction<Looses>>;
	fetchNumber: number;
	fetchData: React.Dispatch<React.SetStateAction<number>>;
};

export const UserContext = createContext({} as UserContextType);

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
	const [userId, setUserId] = useState<UserId>({ userId: '' });
	const [userName, setUserName] = useState<UserName>({ userName: '' });
	const [firstName, setFirstName] = useState<FirstName>({ firstName: '' });
	const [lastName, setLastName] = useState<LastName>({ lastName: '' });
	const [status, setStatus] = useState<Status>({ status: '' });
	const [image, setImage] = useState<AuthImage>({ image: '' });
	const [doubleAuth, setDoubleAuth] = useState<DoubleAuth>({ doubleAuth: false });
	const [verified2FA, setVerified2FA] = useState<DoubleAuthVerified>({
		verified2FA: false,
	});
	const [ranking, setRanking] = useState<Ranking>({ ranking: 1 });
	const [logged, setLogged] = useState<Logged>({ logged: false });
	const [fetching, setFetching] = useState<Fetching>({ fetching: true });
	const [wins, setWins] = useState<Wins>({ wins: 0 });
	const [looses, setLooses] = useState<Looses>({ looses: 0 });

	const [fetchNumber, fetchData] = useState<number>(0);

	useEffect(() => {
		const fetchUser = async () => {
			setFetching({fetching: true});
			const userInfos = await fetchUserData();
			if (!userInfos) {
				setLogged({ logged: false });
			} else {
				console.log('Logged');
				setUserId({ userId: userInfos.id });
				setUserName({ userName: userInfos.username });
				setFirstName({ firstName: !userInfos.first_name ? '' : userInfos.first_name });
				setLastName({ lastName: !userInfos.last_name ? '' : userInfos.last_name });
				setStatus({ status: userInfos.status });
				setImage({ image: !userInfos.profilePic ? 'default.jpg' : userInfos.profilePic });
				setDoubleAuth({ doubleAuth: userInfos.twoFAEnabled });
				setRanking({ ranking: userInfos.ranking })
				setLogged({ logged: true });
				setWins({wins: userInfos.wins})
				setLooses({looses: userInfos.looses})
			}
		}

		fetchUser();
	}, [fetchNumber]);
	return (
		<UserContext.Provider
			value={{
				userId,
				setUserId,
				userName,
				setUserName,
				firstName,
				setFirstName,
				lastName,
				setLastName,
				status,
				setStatus,
				image,
				setImage,
				doubleAuth,
				setDoubleAuth,
				verified2FA,
				setVerified2FA,
				ranking,
				setRanking,
				logged,
				setLogged,
				fetching,
				setFetching,
				wins,
				setWins,
				looses,
				setLooses,
				fetchNumber,
				fetchData
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export function useUserInfos() {
	return useContext(UserContext);
}

export default UserContext;