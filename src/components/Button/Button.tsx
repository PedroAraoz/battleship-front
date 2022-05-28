import React, { PropsWithChildren } from "react"
import Loader from "../Loader/Loader"
import "./Button.css"

type ButtonType = "white" | "blue" | "red"

export type ButtonProps = {
    onClick: (args?: any) => void,
    type: ButtonType,
    disabled?: boolean,
    loading?: boolean,
    loadingText?: string,
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
    const { children, onClick, type, disabled, loading, loadingText } = props

    return (
        <button className={`button-wrapper ${type} ${disabled ? "disabled" : ""} ${loading ? "loading" : ""}`} onClick={onClick} disabled={disabled}>
            {loading ?
                <div className="button-loading">
                    <Loader size={"sm"} color={type === "white" ? "dark" : "light"} />
                    <p className="button-loading-text">{loadingText}</p>
                </div>
                :
                children
            }
        </button>
    )
}

export default Button