import React, { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import Background from "../../components/Background/Background"
import Button from "../../components/Button/Button"
import Card from "../../components/Card/Card"
import Message from "../../components/Message/Message"
import "./ContinuePage.css"

type LocationProps = {
    state: { from: Location }
}

const ContinuePage = () => {
    let navigate = useNavigate()
    let location = useLocation() as unknown as LocationProps

    let [hasOngoingGame, setHasOngoingGame] = useState(false)

    const from = location.state?.from?.pathname || "/home"

    function keepPlaying(): void {
        navigate("/game", { replace: true })
    }

    function surrender(): void {
        navigate("/home", { replace: true })
    }

    useEffect(() => {
        // fetch if user has a game ongoing and update state accordingly
    }, [])

    return false ? (
        <Navigate to={from} state={{ from: location }} replace />
    ) : (
        <Background fullscreen>
            <Card size="lg" raised transparent>
                <Message messages={[
                    {id: "continue-message-1", message: "You have an unfinished game that is still going."}, 
                    {id: "continue-message-2", message:"What would you like to do?"}]} />
                <div className="continue-buttons">
                    <Button onClick={keepPlaying} type={"white"}>
                        KEEP PLAYING
                    </Button>
                    <Button onClick={surrender} type={"red"}>
                        SURRENDER AND CONTINUE TO HOME
                    </Button>
                </div>
            </Card>
        </Background>
    )
}

export default ContinuePage