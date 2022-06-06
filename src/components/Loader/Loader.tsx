import React from "react"
import "./Loader.css"

type LoaderSize = 'sm' | 'lg'

type LoaderColor = 'light' | 'dark'

type LoaderProps = {
    size: LoaderSize,
    color: LoaderColor,
    text?: string
}

const Loader = (props: LoaderProps) => {
    const {size, color, text} = props

    return (
        <div className="loader-wrapper">
            <div className={`loader ${size} ${color}`}/>
            <p>{text}</p>
        </div>
    )
}

export default Loader
