import React from "react";
import Header from "../Header/Header";
import "./Background.css"

export type BackgroundProps = {
    fullscreen?: boolean
}

const Background = (props: React.PropsWithChildren<BackgroundProps>) => {
    const { children, fullscreen } = props

    return (
        <div>
            {fullscreen ?
                <div className={'background fullscreen'}>
                    <Header />
                    {children}
                </div>
                :
                <div>
                    <div className={'background'} />
                    {children}
                </div>
            }
        </div>
    )
}

export default Background