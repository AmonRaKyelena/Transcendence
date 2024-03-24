import '@/styles/globals.css';
import './game.css';
import {FC, useEffect, useRef} from 'react';
import {useState} from 'react';
import {io, Socket} from "socket.io-client";
import {useUserInfos} from '@/contexts/User/Component';
import {useRouter} from 'next/router';

let socket: Socket;

const Game: FC<{ selectedArgument: string }> = ({selectedArgument}) => {
    const username = useUserInfos().userName.userName;
    const [ballPos, setBallPos] = useState([430, 255]);
    const [playerPos, setPlayerPos] = useState([275, 275]);
    const [lobbyId, setLobbyId] = useState('');
    const [enemyName, setEnemyName] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState('');
    const [score, setScore] = useState([0, 0]);
    const players = useRef(['', '']);
    const router = useRouter();


    useEffect(() => {
        console.log("LOL " + selectedArgument);
        socket = io("http://localhost:9000", {
            transports: ['websocket'],
            withCredentials: true
        });

        socket.on("startGame", (data) => {
            players.current = data;
        });

        console.log('Game useEffects');

        socket.on("connect", () => console.log("Connected to WebSocket"));
        socket.on("disconnect", () => console.log("Disconnected from WebSocket"));
        socket.on("gameOver", (data) => {
            setGameOver(true);
            setWinner(data.winner);
        });

        socket.on("enemyName", (data) => {
            setEnemyName(data);
        });

        socket.on("message", (data) => {
            console.log(data);
        });

        socket.on("ok", (data) => {
            console.log(data);
        });

        socket.on("positions", (data) => {
            const newPositions = JSON.parse(data);
            setBallPos([newPositions.ball.y, newPositions.ball.x]);
            setPlayerPos([newPositions.paddles[players.current[0]].y, newPositions.paddles[players.current[1]].y]);
            setScore([newPositions.paddles[players.current[0]].score, newPositions.paddles[players.current[1]].score]);
        });
        socket.emit('joinLobby', {userId: username, modeGame: selectedArgument});

        return () => {
            socket.disconnect();
        };
    }, [username, selectedArgument]);

    const handleExitToMenu = () => {
        router.push('/');
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
                socket.emit("newPositionUp", username);
            } else if (event.key === 'ArrowDown') {
                socket.emit("newPositionDown", username);
            }
        };

        const endKey = (event: KeyboardEvent) => {
        };

        document.addEventListener('keydown', handleKeyPress);
        document.addEventListener('keyup', endKey);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.removeEventListener('keyup', endKey);
        };
    }, []);

    const renderGameContent = () => {
        if (selectedArgument === 'default') {

            return (
                <div className="game">
                    {username === players.current[0] ? (
                        <div className='player_btns'>
                            <div className='btn_player'>{username}</div>
                            <div className='btn_player btn_enemy'>{players.current[1]}</div>
                        </div>
                    ) : (
                        <div className='player_btns'>
                            <div className='btn_player btn_enemy'>{players.current[0]}</div>
                            <div className='btn_player'>{username}</div>
                        </div>
                    )}

                    <div className='back'>
                        <div className='game_separation_line'></div>
                        <div className='player' style={{top: (playerPos[0] + 36) + 'px'}}></div>
                        <div className='player enemy_player' style={{top: playerPos[1] + 36 + 'px'}}></div>
                        <div className='ball' style={{top: ballPos[0] + 'px', left: ballPos[1] + 'px'}}></div>
                        <div className='counter'>{score[0]}</div>
                        <div className='counter counter_enemy'>{score[1]}</div>
                    </div>

                    {gameOver && (
                        <div className="game-over-modal">
                            <h1>Game Over</h1>
                            <p>Winner: {winner}</p>
                            <button onClick={handleExitToMenu}>Exit to Menu</button>
                        </div>
                    )}
                </div>
            );

        } else {
            return (
                <div className="game">
                    {username === players.current[0] ? (
                        <div className='player_btns'>
                            <div className='btn_player'>{username}</div>
                            <div className='btn_player btn_enemy'>{players.current[1]}</div>
                        </div>
                    ) : (
                        <div className='player_btns'>
                            <div className='btn_player btn_enemy'>{players.current[0]}</div>
                            <div className='btn_player'>{username}</div>
                        </div>
                    )}
                    <div className='another-back'>
                        <div className='game_separation_line'></div>
                        <div className='player' style={{top: (playerPos[0] + 36) + 'px'}}></div>
                        <div className='player enemy_player' style={{top: playerPos[1] + 36 + 'px'}}></div>
                        <div className='ball' style={{top: ballPos[0] + 'px', left: ballPos[1] + 'px'}}></div>
                        <div className='counter'>{score[0]}</div>
                        <div className='counter counter_enemy'>{score[1]}</div>
                    </div>

                    {gameOver && (
                        <div className="game-over-modal">
                            <h1>Game Over</h1>
                            <p>Winner: {winner}</p>
                            <button onClick={handleExitToMenu}>Exit to Menu</button>
                        </div>
                    )}
                </div>
            );
        }
    };
    return <>{renderGameContent()}</>;
};

export default Game;