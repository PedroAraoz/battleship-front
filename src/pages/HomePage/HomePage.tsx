import React, {useEffect, useState} from "react"
import {Navigate, useLocation, useNavigate} from "react-router-dom"
import Background from "../../components/Background/Background"
import Button from "../../components/Button/Button"
import GameCard from "../../components/GameCard/GameCard"
import Loader from "../../components/Loader/Loader"
import Message from "../../components/Message/Message"
import User from "../../components/User/User"
import {BackendGame, Game, GameResult} from "../../models"
import "./HomePage.css"
import {get, post} from "../../utils/fetch"
import {useAuth} from "../../utils/auth"
import {Container, Snackbar} from "@mui/material"
import {getGameGrid} from "../../utils/game"

type LocationProps = {
    state: { from: Location }
}

const HomePage = () => {
    let location = useLocation() as unknown as LocationProps
    let navigate = useNavigate()
    let auth = useAuth()

    let [ongoingGameId, setOngoingGameId] = useState("")

    let [loadingPastGames, setLoadingPastGames] = useState(false)
    let [games, setGames] = useState<Game[]>([])

    let [searchingGame, setSearchingGame] = useState(false)
    let [joiningGame, setJoiningGame] = useState(false)

    let [error, setError] = useState(false)
    let [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        setLoadingPastGames(true)
        get("games", auth.user().token).then(data => {
            let games: Game[] = []
            let ongoingGame: BackendGame
            if (data.length > 0) {
                let ongoingGames = data.filter((g: BackendGame) => !g.winner)
                if (ongoingGames.length > 0) {
                    ongoingGame = ongoingGames[0]
                    if (ongoingGame.started) setOngoingGameId(`${ongoingGame.id}`)
                    else navigate(`/game/${ongoingGame.id}`)
                }
                games = data.filter((g: BackendGame) => g.winner).map((g: BackendGame) => {
                    const userId = auth.user().id
                    const enemyId = [g.user1, g.user2].filter(u => u.toString() !== userId)[0]
                    return {
                        gameId: g.id,
                        gameResult: `${g.winner}` === userId ? GameResult.VICTORY : g.surrender ? GameResult.SURRENDER : GameResult.DEFEAT,
                        enemyId,
                        gameDate: new Date(g.createdAt.replaceAll('-', ',')).toLocaleDateString(),
                        state: {
                            myFleet: getGameGrid(g.ships.filter(s => `${s.userId}` === `${userId}`), g.shots.filter(s => `${s.userId}` !== `${userId}`)),
                            enemyFleet: getGameGrid(g.ships.filter(s => `${s.userId}` !== `${userId}`), g.shots.filter(s => `${s.userId}` === `${userId}`))
                        }
                    }
                })
            }
            if (ongoingGameId) {
                navigate(`/continue/${ongoingGameId}`)
            } else {
                setGames(games)
                setLoadingPastGames(false)
            }
        })
    }, [])

    function searchGame() {
        setError(false)
        setSearchingGame(true)
        setTimeout(joinGame, 1000)
    }

    function joinGame() {
        setSearchingGame(false)
        setJoiningGame(true)
        post('game/join', auth.user().token)
            .then(data => {
                let gameId = data.res
                navigate(`/game/${gameId}`)
                setJoiningGame(false)
            })
            .catch(e => {
                setJoiningGame(false)
                setErrorMessage("Unable to join a new game. Please try again later!")
                setError(true)
            })
    }

    return ongoingGameId ? (
        <Navigate to={`/continue/${ongoingGameId}`} state={{from: location}} replace/>
    ) : (
        <Background>
            <Container>
                <div className="actions">
                    <User/>
                    <Button onClick={searchGame}
                            disabled={searchingGame || joiningGame}
                            type={(searchingGame || joiningGame) ? "white" : "blue"}
                            loading={searchingGame || joiningGame}
                            loadingText={searchingGame ? "Searching game..." : "Joining game..."}>
                        START A NEW GAME
                    </Button>
                </div>
            </Container>
            {loadingPastGames ?
                <Loader size={"lg"} color={"dark"}/> :
                <Container>
                    {games.length > 0 ?
                        <div className="home-past-games-wrapper">
                            {games.reverse().map(g => {
                                return <GameCard
                                    key={`game-card-${g.gameId}`}
                                    lastGameState={g.state}
                                    summary={{
                                        gameId: g.gameId,
                                        gameResult: g.gameResult,
                                        enemyId: g.enemyId,
                                        gameDate: g.gameDate
                                    }}/>
                            })}
                        </div> :
                        <div className="home-message-wrapper">
                            <Message messages={[
                                {id: "home-message-1", message: "Your past games will appear here."},
                                {id: "home-message-2", message: "Click on “START A NEW GAME” to start playing."}]}/>
                        </div>
                    }
                </Container>
            }
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={error}
                onClose={() => setError(false)}
                autoHideDuration={6000}
                message={errorMessage}
            />
        </Background>
    )
}
export default HomePage