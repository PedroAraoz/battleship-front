import React from "react"
import "./Message.css"
import battleship from "../../assets/battleship.png"

export type MessageString = {
    id: string | number,
    message: string
}

export type MessageProps = {
    messages: MessageString[],
    icon?: { src: string, alt: string }
}

const Message = (props: MessageProps) => {
    const { messages, icon } = props

    return (
        <div className="message-wrapper">
            <img alt={icon?.alt ? icon.alt : "battleship"} src={icon?.src ? icon.src : battleship} />
            <div className="messages">
                {messages.map(m => {
                    return <p key={`${m.id}`}>{m.message}</p>
                })}
            </div>
        </div>
    )
}

export default Message
