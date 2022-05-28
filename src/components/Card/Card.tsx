import React from "react"
import "./Card.css"

type CardSize = 'lg' | 'sm'

export type CardProps = {
    size: CardSize
    transparent?: boolean
    raised?: boolean
}

const Card = (props: React.PropsWithChildren<CardProps>) => {
    const {children, size, transparent, raised} = props

    return (
        <div className={`card-wrapper ${size} ${transparent ? "transparent" : ""} ${raised ? "raised" : ""}`}>
            <div className="card-content">
                {children}
            </div>
        </div>
    )
}

export default Card