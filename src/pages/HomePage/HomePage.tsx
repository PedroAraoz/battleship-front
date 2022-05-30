import { Container } from "@mui/system"
import React, { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import Background from "../../components/Background/Background"
import Button from "../../components/Button/Button"
import GameCard from "../../components/GameCard/GameCard"
import Loader from "../../components/Loader/Loader"
import Message from "../../components/Message/Message"
import User from "../../components/User/User"
import { Game, GameResult } from "../../models"
import "./HomePage.css"

type LocationProps = {
    state: { from: Location }
}

const HomePage = () => {
    let location = useLocation() as unknown as LocationProps

    let [searchingGame, setSearchingGame] = useState(false)
    let [loadingPastGames, setLoadingPastGames] = useState(false)
    let [games, setGames] = useState<Game[]>([])
    let [hasOngoingGame, setHasOngoingGame] = useState(false)

    useEffect(() => {
        // fetch user past games and if it has ongoing game
    }, [])

    function searchGame() {
        setSearchingGame(true)
        // when joined to a game, redirect to /game
    }

    return hasOngoingGame ? (
        <Navigate to={"/continue"} state={{ from: location }} replace />
    ) : (
        <Background>
            <Container>
                <div className="actions">
                    <User />
                    <Button onClick={searchGame}
                        type={searchingGame ? "white" : "blue"}
                        loading={searchingGame}
                        loadingText={"searching..."}>
                        <p>START A NEW GAME</p>
                    </Button>
                </div>
            </Container>
            {loadingPastGames ?
                <Loader size={"lg"} color={"dark"} /> :
                <Container>
                    {games ?
                        <div className="home-past-games-wrapper">
                            {games.map(g => {
                                return <GameCard
                                    key={`game-card-${g.gameId}`}
                                    lastGameState={g.states[g.states.length - 1]}
                                    summary={{ gameId: g.gameId, enemyName: g.enemyName, result: g.result }} />
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