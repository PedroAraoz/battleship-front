import React from "react";
import {useNavigate} from "react-router-dom"
import {post} from "../../utils/fetchHelper";

const JoinGame = () => {

    const navigate = useNavigate();
    let chatId;

    const joinGame = () => {
        post('game/join')
            .then(data => {
                chatId = data.res;
                navigate(`/game/${chatId}`);
            });
    }

    return (
        <div>
            <h1>Game</h1>
            <button onClick={joinGame}>JOINGAME</button>
        </div>
    );
};

export default JoinGame;