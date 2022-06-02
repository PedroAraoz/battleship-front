import React from 'react'
import {useParams} from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {get} from '../../utils/fetchHelper';


const GamePage = () => {
    let {gameId} = useParams();
    let stompClient;
    let messages: string[];
    let game;
    let sub;

    const connectWebSocket = () => {
        console.log('connecting to websocket');
        const socket = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`);
        const over = Stomp.over(socket);
        stompClient = over;
        over.connect({}, function () {
            console.log('connected!')
            checkIfGameStarted()
        });
    };

    const onMessageReceived = (msg) => {
        
        console.log('message recieved:', msg);
        messages.push(msg);
    }

    const checkIfGameStarted = () => {
        console.log('checking if game has started');
        let started: boolean;
        get(`game/started/${gameId}`)
            .then(data => {
                started = data.res === 'true';
                if (started) loadGame();
                joinGame();
            })
    }

    const loadGame = () => {
        console.log('loading game');
        get(`game/${gameId}`)
            .then(data => {
                game = data;
                messages = data.messages;
            })
    }

    const joinGame = () => {
        console.log('joining game')
        sub = stompClient.subscribe(
            `/queue/messages/${gameId}`,
            onMessageReceived,
            {id: gameId}
        );
    }


    return (
        <div>
            <h1>Game {gameId}!</h1>
            <button onClick={connectWebSocket}>CONNECT</button>
            <p>{messages ? messages : 'no messages'}</p>
        </div>
    )
}

export default GamePage