import React from "react";
import "./Loader.css"

type LoaderSize = 'sm' | 'lg'

type LoaderColor = 'light' | 'dark'

type LoaderProps = {
    size: LoaderSize,
    color: LoaderColor
}

const Loader = (props: LoaderProps) => {
    const {size, color} = props

    return (
        <div className="loader-wrapper">
            <div className={`loader ${size} ${color}`}/>
        </div>
    )
}

export default Loader
