import './gameMenu.css'
import { FC, useEffect, useState } from 'react';
import Game from './Game';
import { useUserInfos } from '@/contexts/User/Component';
import GoToAuth from '@/components/common/auth/GoToAuth';
import FriendList from '../Friends/FrindList';
import PageLoading from '../../common/PageLoading';
import GameLoad from './GameLoad';

const GameMenu: FC = () => {
	const loading = useUserInfos().fetching.fetching;
	const logged = useUserInfos().logged.logged;
	const [gameStart, setGameStart] = useState(false);
	const [selectedArgument, setSelectedArgument] = useState("");

	const userData = useUserInfos();

	useEffect(() => {
		if (userData.fetching.fetching === true)
			setTimeout(() => userData.setFetching({fetching: false}), 1000);
	}, [userData.fetching.fetching]);

	const startGame = () => {
		setSelectedArgument("default");
		setGameStart(true);
	}

	const startGameWithArgument = (argument: string) => {
		setSelectedArgument(argument);
		setGameStart(true);
	  };

	if (loading) {
		return (
			<div className="game">
				<div style={{height: '39px'}}></div>
				<div className='back'>
					<PageLoading/>
				</div>
			</div>
		);
	}

	if (!logged) {
		return (
			<div className="game">
				<div style={{height: '39px'}}></div>
				<div className='back'>
					<GoToAuth/>
				</div>
			</div>
		)
	}

	if (!gameStart) {
		return (
			<div className='game'>
				<div style={{height: '39px'}}></div>
				<div className='back'>
					<div className='right_part'>
						<h1>Choose player</h1>
						<button className='btn_random_player' onClick={() => startGameWithArgument("default")}>Default Game</button>
            			<button className='btn_random_player' onClick={() => startGameWithArgument("modificate")}>NOT Default Game</button>
					</div>
				</div>

			</div>
		)
	}

	return <GameLoad selectedArgument={selectedArgument} />;
	
};

export default GameMenu