import React, {useEffect, useState} from "react"
import {Navigate, useLocation, useNavigate} from "react-router-dom"
import Background from "../../components/Background/Background"
import Button from "../../components/Button/Button"
import GameCard from "../../components/GameCard/GameCard"
import Loader from "../../components/Loader/Loader"
import Message from "../../components/Message/Message"
import User from "../../components/User/User"
import {Game} from "../../models"
import "./HomePage.css"
import {post} from "../../utils/fetch"
import {useAuth} from "../../utils/auth"
import {Container} from "@mui/material"

type LocationProps = {
    state: { from: Location }
}

const HomePage = () => {
    let location = useLocation() as unknown as LocationProps
    let navigate = useNavigate()
    let auth = useAuth()

    let [ongoingGameId, setOngoingGameId] = useState(getOngoingGameId())

    let [loadingPastGames, setLoadingPastGames] = useState(false)
    let [games, setGames] = useState<Game[]>([])

    let [searchingGame, setSearchingGame] = useState(false)
    let [joiningGame, setJoiningGame] = useState(false)

    useEffect(() => {
        // TODO fetch past games
        setLoadingPastGames(true)
        setTimeout(() => setLoadingPastGames(false), 2000)
    }, [])

    function joinGame() {
        setSearchingGame(false)
        setJoiningGame(true)
        post('game/join', auth.user().token).then(data => {
            let gameId = data.res
            if (!!gameId) navigate(`/game/${gameId ? gameId : "/game/undefined"}`) // TODO remove this /game/undefined
            setJoiningGame(false)
        })
    }

    function searchGame() {
        setSearchingGame(true)
        setTimeout(joinGame, 2000)
    }

    function getOngoingGameId(): string {
        // TODO fetch ongoing gameId
        return ""
    }

    return ongoingGameId ? (
        <Navigate to={`/continue/${ongoingGameId}`} state={{ from: location }} replace />
    ) : (
        <Background>
            <Container>
                <div className="actions">
                    <User />
                    <Button onClick={searchGame}
                            type={(searchingGame || joiningGame) ? "white" : "blue"}
                            loading={searchingGame || joiningGame}
                            loadingText={searchingGame ? "Searching game..." : "Joining game..."}>
                        START A NEW GAME
                    </Button>
                </div>
            </Container>
            {loadingPastGames ?
                <Loader size={"lg"} color={"dark"} /> :
                <Container>
                    {games.length > 0 ?
                        <div className="home-past-games-wrapper">
                            {games.map(g => {
                                return <GameCard
                                    key={`game-card-${g.gameId}`}
                                    lastGameState={g.states[g.states.length - 1]}
                                    summary={{ gameId: g.gameId, enemy: g.enemy, result: g.result }} />
                            })}
                        </div> :
                        <div className="home-message-wrapper">
                            <Message messages={[
                                { id: "home-message-1", message: "Your past games will appear here." },
                                { id: "home-message-2", message: "Click on “START A NEW GAME” to start playing." }]} />
                        </div>
                    }
                </Container>
            }
        </Background>
    )
}
export default HomePage