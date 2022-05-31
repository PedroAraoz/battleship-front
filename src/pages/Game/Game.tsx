import React from "react";
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import {useAuth} from "../../utils/auth";


const Chat = () => {

    let auth = useAuth()
    let stompClient;

    const onMessageReceived = (msg) => {
        console.log(msg)
    }

    const connectWebSocket = () => {
        const socket = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`);
        const over = Stomp.over(socket);
        stompClient = over;
        over.connect({}, function () {
            console.log("connected!")
        });
    };

    const joinGame = () => {
        const token = auth.user.arguments.token
        fetch(`${process.env.REACT_APP_SERVER_URL}/game/join`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(data => {
                console.log("chatId", data)
            })
            .catch(error => console.log("error:", error))
    }

    const subscribe = () => {
        const sub = stompClient.current.subscribe(
            "/queue/messages",
            onMessageReceived,
            {id: '123'}
        );
    }


    return (
        <div>
            <h1>chat</h1>
            <button onClick={connectWebSocket}>CONNECT</button>
            <button onClick={joinGame}>JOINGAME</button>
        </div>
    );
};

export default Chat;