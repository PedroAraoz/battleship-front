import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {get, token} from '../../utils/fetchHelper';


const GamePage = () => {
    let {gameId} = useParams();
    let [stompClient, setStompClient] = useState(null);
    let [messages, setMessages] = useState([]);
    let [game, setGame] = useState(null);
    let [sub, setSub] = useState(null);
    let [message, setMessage] = useState('');

    useEffect(() => {
        connectWebSocket()
    }, [])

    useEffect(() => {
        if (stompClient) checkIfGameStarted()
    }, [stompClient])


    const connectWebSocket = () => {
        const socket = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`);
        var a = Stomp.over(socket)
        a.connect({}, function () {
            setStompClient(a);
        });
    };

    const onMessageReceived = (msg) => {

        console.log('message recieved:', msg.body);
        messages.push(JSON.parse(msg.body))
        setMessages(messages)
    }

    const checkIfGameStarted = () => {
        let started: boolean;
        get(`game/started/${gameId}`)
            .then(data => {
                started = data.res === 'true';
                if (started) loadGame();
                joinGame();
            })
    }

    const loadGame = () => {
        get(`game/${gameId}`)
            .then(data => {
                game = data;
                messages = data.messages;
            })
    }

    const joinGame = () => {
        sub = stompClient.subscribe(
            `/queue/messages/${gameId}`,
            onMessageReceived
        )
        setSub(sub)

    }

    const handleChange = event => {
        setMessage(event.target.value);
    };

    const handleClick = event => {
        event.preventDefault();
        let obj = {
            gameId: gameId,
            content: 'buenas',
            token: `Bearer ${token}`
        }
        stompClient.send("/app/game", {}, JSON.stringify(obj))
        setMessage('')
    };

    return (
        <div>
            <h1>Game {gameId}!</h1>
            <input onChange={handleChange} value={message}/>
            <button onClick={handleClick}>send!</button>
            <p>{
                // messages.map(m => m.content)[0]
                // mostrar mensajes de alguna forma
            }</p>
        </div>
    )
}

export default GamePage