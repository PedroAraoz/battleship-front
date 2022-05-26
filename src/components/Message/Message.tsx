import React from "react";
import "./Message.css";
import battleship from "../../assets/battleship.png";

export type MessageProps = {
    message: string,
    icon?: {src: string, alt: string}
    
}

const Message = (props: MessageProps) => {
    const {message, icon} = props

    return (
        <div className="message-wrapper">
            <img alt={icon?.alt ? icon.alt : "battleship"} src={icon?.src ? icon.src : battleship}/>
            <p>{message}</p>
        </div>
    )
}

export default Message
