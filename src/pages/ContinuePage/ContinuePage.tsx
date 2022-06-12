import React, {useEffect} from "react"
import {Navigate, useLocation, useNavigate, useParams} from "react-router-dom"
import Background from "../../components/Background/Background"
import Button from "../../components/Button/Button"
import Card from "../../components/Card/Card"
import Message from "../../components/Message/Message"
import "./ContinuePage.css"
import {get, post} from "../../utils/fetch"
import {useAuth} from "../../utils/auth"

type LocationProps = {
    state: { from: Location }
}

const ContinuePage = () => {
    let auth = useAuth()
    let navigate = useNavigate()
    let location = useLocation() as unknown as LocationProps

    let {gameId} = useParams()

    const from = location.state?.from?.pathname || "/home"

    useEffect(() => {
        get(`game/${gameId}`, auth.user().token).catch(e => navigate("/not-found", { replace: true }))
    }, [])

    function keepPlaying(): void {
        navigate(`/game/${gameId}`, { replace: true })
    }

    function surrender(): void {
        post(`game/${gameId}/surrender`, auth.user().token).then(() => navigate("/home", { replace: true }))
    }

    return gameId ? (
        <Background fullscreen>
            <Card size="lg" raised transparent>
                <Message messages={[
                    {id: "continue-message-1", message: "You have an unfinished game that is still going."},
                    {id: "continue-message-2", message: "What would you like to do?"}]}/>
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
    ) : (
        <Navigate to={from} state={{from: location}} replace/>
    )
}

export default ContinuePage