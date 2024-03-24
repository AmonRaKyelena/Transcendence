import './gameLoad.css'
import { FC, useState } from 'react';
import Game from './Game';
import { useUserInfos } from '@/contexts/User/Component';
import GoToAuth from '@/components/common/auth/GoToAuth';
import FriendList from '../Friends/FrindList';

interface GameLoadProps {
	selectedArgument?: string;
  }

const GameLoad: FC<GameLoadProps> = ({ selectedArgument = "default" }) => {	
	const loading = useUserInfos().fetching.fetching;
	const logged = useUserInfos().logged.logged;
	const [gameStart, setGameStart] = useState(false);

	const startGame = () => {
		setGameStart(true);
	}

	if (loading) {
		return (
			<div className="game">
				<div style={{height: '39px'}}></div>
				<div className='back'>
					<div className='separation_line' style={{marginLeft: '448.5px'}}></div>
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
						<h1>Loading</h1>
                        <div className='start_button'>
                            <button className='btn_start' onClick={startGame}>Start!</button>
                        </div>
					</div>

					
				</div>

			</div>
		)
	} else {
		return <Game selectedArgument={selectedArgument} />;
	}	
};

export default GameLoad