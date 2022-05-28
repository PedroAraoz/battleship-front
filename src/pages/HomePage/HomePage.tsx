import React, { useState } from "react"
import Background from "../../components/Background/Background"
import Button from "../../components/Button/Button"
import Loader from "../../components/Loader/Loader"
import User from "../../components/User/User"
import "./HomePage.css"

const HomePage = () => {
    const [searchingMatch, setSearchingMatch] = useState(false)

    return (
        <Background>
            <div className="actions">
                <User />
                <Button onClick={() => { setSearchingMatch(!searchingMatch) }}
                    type={searchingMatch ? "white" : "blue"}
                    loading={searchingMatch}
                    loadingText={"searching..."}>
                    <p>START A NEW GAME</p>
                </Button>
            </div>
            <Loader size={"lg"} color={"dark"} />
        </Background>
    )
}
export default HomePage