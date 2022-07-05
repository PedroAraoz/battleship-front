import React, {useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from "stompjs"
import {get} from "../../utils/fetch"
import {
    BackendGame,
    GameGrid,
    GameGridPointType,
    GameMessageType,
    SetupShip,
    ShipOrientation
} from "../../models"
import Background from "../../components/Background/Background"
import {Alert, Container, FormControlLabel, Snackbar, Switch} from "@mui/material"
import User from "../../components/User/User"
import Button from "../../components/Button/Button"
import Card from "../../components/Card/Card"
import "./GamePage.css"
import GameGridCard from "../../components/GameGridCard/GameGridCard"
import {useAuth} from "../../utils/auth"
import {SwapVert} from "@mui/icons-material"
import Loader from "../../components/Loader/Loader"
import {getGameGrid, setRandomGameGrid, overlapsShipHorizontally, overlapsShipVertically} from "../../utils/game"
import hit from '../../assets/hit.mp3'

const ships: SetupShip[] = [
    {name: 'Carrier', size: 5, placed: false, startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}},
    {name: 'Battleship', size: 4, placed: false, startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}},
    {name: 'Cruiser', size: 3, placed: false, startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}},
    {name: 'Submarine', size: 3, placed: false, startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}},
    {name: 'Destroyer', size: 2, placed: false, startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}}
]

enum GamePhase {
    SETUP,
    HOME_TURN,
    AWAY_TURN,
    HOME_WINS,
    AWAY_WINS
}

const GamePage = () => {
    let navigate = useNavigate()
    let auth = useAuth()
    let audio = new Audio(hit)

    let {gameId} = useParams()

    let [gameHasStarted, setGameHasStarted] = useState(false)
    let [gamePhase, setGamePhase] = useState<GamePhase>()

    let [setupGameGrid, setSetupGameGrid] = useState(getGameGrid())
    let [setupGameShips, setSetupGameShips] = useState<SetupShip[]>(ships)
    let [setupShipOrientation, setSetupShipOrientation] = useState<ShipOrientation>(ShipOrientation.HORIZONTAL)
    let [setupShipSelected, setSetupShipSelected] = useState<SetupShip>()
    let [setupWaitingOpponent, setSetupWaitingOpponent] = useState(false)

    let [enemyGameGrid, setEnemyGameGrid] = useState<GameGrid>()

    let [stompClient, setStompClient] = useState(null)
    let [messages, setMessages] = useState([])
    let [sub, setSub] = useState(null)

    const userId = auth.user().id

    useEffect(() => {
        connectWebSocket()
    }, [])

    useEffect(() => {
        if (stompClient) {
            get(`game/${gameId}`, auth.user().token)
                .then((data: BackendGame) => {
                    setGameHasStarted(data.started)
                })
                .then(joinGame)
                .catch(e => navigate("/not-found", {replace: true}))
        }
    }, [stompClient])

    function connectWebSocket() {
        let sc = Stomp.over(new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`))
        sc.debug = null
        sc.connect({}, function () {
            setStompClient(sc)
        })
    }

    function joinGame() {
        setSub(stompClient.subscribe(`/queue/messages/${gameId}/${userId}`, onMessageReceived))
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({type: GameMessageType.GET_STATE}))
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({type: GameMessageType.GET_BOARD}))
    }

    function checkIfGameStarted() {
        get(`game/${gameId}`, auth.user().token)
            .then((data: BackendGame) => setGameHasStarted(data.started))
            .catch(e => navigate("/not-found", {replace: true}))
    }

    function onMessageReceived(msg) {
        const msgParsed = JSON.parse(msg.body)
        switch (msgParsed.type) {
            case GameMessageType.START: {
                setGamePhase(GamePhase.SETUP)
                checkIfGameStarted()
                break
            }
            case GameMessageType.TURN_START: {
                setGamePhase(GamePhase.HOME_TURN)
                stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({type: GameMessageType.GET_BOARD}))
                break
            }
            case GameMessageType.WAITING: {
                setGamePhase(GamePhase.AWAY_TURN)
                stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({type: GameMessageType.GET_BOARD}))
                break
            }
            case GameMessageType.WINNER: {
                if (`${msgParsed.winner}` === `${userId}`) {
                    setGamePhase(GamePhase.HOME_WINS)
                } else {
                    setGamePhase(GamePhase.AWAY_WINS)
                }
                break
            }
            case GameMessageType.BOARD_DATA: {
                setSetupGameGrid(getGameGrid(msgParsed.ships, msgParsed.opponentShots))
                setEnemyGameGrid(getGameGrid([], msgParsed.yourShots))
                break
            }
            case GameMessageType.SHOT_RESULT: {
                if (msgParsed.hit === true) {
                    audio.play()
                }
                stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({type: GameMessageType.GET_BOARD}))
                break
            }
            default:
                break
        }
        console.log("message recieved: ", msgParsed)
        messages.push(msgParsed)
        setMessages(messages)
    }

    function goHome() {
        navigate("/home")
    }

    function surrender() {
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({type: GameMessageType.SURRENDER}))
    }

    function renderShipBlocks(s: SetupShip) {
        let blocks = []
        for (let i = 0; i < s.size; i++) {
            blocks.push(<div key={`${s.name}-block-${i}`} className={"ship-block"}></div>)
        }
        return blocks
    }

    function resetSetupGrid() {
        setSetupGameShips(ships)
        setSetupGameGrid(getGameGrid())
    }

    function randomSetupGrid() {
        setRandomGameGrid([...ships], [], getGameGrid(), setSetupGameShips, setSetupGameGrid)
    }

    function confirmSetupGrid() {
        let wsShips = setupGameShips.map(s => {
            return {
                size: s.size,
                startPos: s.startPos,
                endPos: s.endPos,
                userId: userId
            }
        })
        let m = {
            type: GameMessageType.SHIP_PLACEMENT,
            ships: wsShips,
            random: false
        }
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify(m))
        setSetupWaitingOpponent(true)
    }

    function changeSetupShipOrientation() {
        setSetupShipOrientation(setupShipOrientation === ShipOrientation.HORIZONTAL ?
            ShipOrientation.VERTICAL : ShipOrientation.HORIZONTAL)
    }

    function setupGridPointClick(i, j) {
        if (setupShipSelected && !setupShipSelected.placed) {
            let auxGridData = {gridBlocks: [...setupGameGrid.gridBlocks]}
            let placedShip = false
            let x: number
            let y: number
            for (let i = 0; i < setupGameGrid.gridBlocks.length; i++) {
                for (let j = 0; j < setupGameGrid.gridBlocks.length; j++) {
                    let gamePoint = auxGridData.gridBlocks[i][j]
                    if (gamePoint.placingShip) {
                        gamePoint.type = GameGridPointType.SHIP
                        placedShip = true
                        x = j
                        y = i
                    }
                }
            }
            if (placedShip) {
                let auxSetupShips = [...setupGameShips]
                let auxShip = {
                    ...setupShipSelected,
                    placed: true,
                    startPos: setupShipOrientation === ShipOrientation.HORIZONTAL ?
                        {x: x - (setupShipSelected.size - 1), y: y} : {x: x, y: y - (setupShipSelected.size - 1)},
                    endPos: setupShipOrientation === ShipOrientation.HORIZONTAL ?
                        {x: x, y: y} : {x: x, y: y}
                }
                auxSetupShips[setupGameShips.indexOf(setupShipSelected)] = auxShip
                setSetupGameShips(auxSetupShips)
                setSetupShipSelected(auxShip)
            }
            setSetupGameGrid(auxGridData)
        }
    }

    function setupGridPointHover(i, j): boolean {
        let auxGridData = {gridBlocks: [...setupGameGrid.gridBlocks]}
        let placing = false
        if (setupShipSelected && !setupShipSelected.placed) {
            let gridSize = auxGridData.gridBlocks.length
            if (setupShipOrientation === ShipOrientation.HORIZONTAL) {
                if (j + setupShipSelected.size <= gridSize) {
                    if (!overlapsShipHorizontally(i, j, setupGameGrid, setupShipSelected)) {
                        for (let n = 0; n < setupShipSelected.size; n++) {
                            auxGridData.gridBlocks[i][j + n].placingShip = true
                            placing = true
                        }
                    }
                }
            } else {
                if (i + setupShipSelected.size <= gridSize) {
                    if (!overlapsShipVertically(i, j, setupGameGrid, setupShipSelected)) {
                        for (let n = 0; n < setupShipSelected.size; n++) {
                            auxGridData.gridBlocks[i + n][j].placingShip = true
                            placing = true
                        }
                    }
                }
            }
        }
        setSetupGameGrid(auxGridData)
        return placing
    }

    function setupGridPointLeave() {
        let auxGridData = {gridBlocks: [...setupGameGrid.gridBlocks]}
        for (let i = 0; i < setupGameGrid.gridBlocks.length; i++) {
            for (let j = 0; j < setupGameGrid.gridBlocks.length; j++) {
                auxGridData.gridBlocks[i][j].placingShip = false
            }
        }
        setSetupGameGrid(auxGridData)
    }

    function enemyGridPointHover(i, j) {
        let auxGridData = {gridBlocks: [...enemyGameGrid.gridBlocks]}
        auxGridData.gridBlocks[i][j].placingShip = true
        setEnemyGameGrid(auxGridData)
    }

    function enemyGridPointLeave() {
        let auxGridData = {gridBlocks: [...enemyGameGrid.gridBlocks]}
        for (let i = 0; i < setupGameGrid.gridBlocks.length; i++) {
            for (let j = 0; j < setupGameGrid.gridBlocks.length; j++) {
                auxGridData.gridBlocks[i][j].placingShip = false
            }
        }
        setEnemyGameGrid(auxGridData)
    }

    function enemyGridPointClick(i, j) {
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({
            type: GameMessageType.SHOT,
            pos: {x: j, y: i}
        }))
    }

    function fireRandomEnemyGamePoint() {
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({
            type: GameMessageType.SHOT,
            random: true
        }))
    }

    function handleChange(event) {
        stompClient.send(`/app/game/${gameId}/${userId}`, {}, JSON.stringify({
            type: GameMessageType.AUTOSHOOT
        }))
    }

    return (
        <Background>
            <Container>
                <div className="actions">
                    <User/>
                    {gamePhase === GamePhase.HOME_WINS || gamePhase === GamePhase.AWAY_WINS ?
                        <Button onClick={goHome} type={"blue"}>GO BACK HOME</Button>
                        :
                        <Button onClick={surrender} type={"red"}>SURRENDER</Button>
                    }
                </div>
                {gamePhase === GamePhase.SETUP &&
                    <div className={"game-board-wrapper"}>
                        <Card size={"sm"}>
                            <div className={"game-board-card-head"}>
                                <h4>Fleet Deployment</h4>
                            </div>
                            <div className={"game-board-card-body"}>
                                <GameGridCard
                                    gridData={setupGameGrid}
                                    onGridPointClick={setupGridPointClick}
                                    onGridPointHover={setupGridPointHover}
                                    onGridPointLeave={setupGridPointLeave}/>
                                {gameHasStarted ?
                                    <div className={"game-ships"}>
                                        {setupGameShips.map((s, i) => {
                                            return (
                                                <div
                                                    className={`ship-wrapper${s.placed ? " placed" : ""}${setupShipSelected === s ? " selected" : ""}`}
                                                    onClick={() => {
                                                        if (!s.placed) setSetupShipSelected(s)
                                                    }}
                                                    key={`${s.name}-${i}`}
                                                >
                                                    <h4>{s.name}</h4>
                                                    {renderShipBlocks(s)}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    :
                                    <Loader size={"lg"} color={"dark"}/>
                                }
                            </div>
                        </Card>
                        <div className={"game-actions"}>
                            <div className={"actions-group"}>
                                <Button disabled={setupWaitingOpponent || !gameHasStarted}
                                        onClick={changeSetupShipOrientation} type={"white"}>
                                    <SwapVert style={{
                                        transform: setupShipOrientation === ShipOrientation.HORIZONTAL ? "rotate(90deg)" : "",
                                        margin: "4px"
                                    }}/>
                                    CHANGE SHIP ORIENTATION
                                </Button>
                                <Button disabled={setupWaitingOpponent || !gameHasStarted} onClick={resetSetupGrid}
                                        type={"white"}>RESET GRID</Button>
                                <Button disabled={setupWaitingOpponent || !gameHasStarted} onClick={randomSetupGrid}
                                        type={"white"}>RANDOM GRID</Button>
                            </div>
                            <Button onClick={confirmSetupGrid} type={"blue"}
                                    disabled={setupWaitingOpponent || setupGameShips.filter(s => s.placed === false).length > 0 || !gameHasStarted}
                                    loading={setupWaitingOpponent || !gameHasStarted}
                                    loadingText={"Waiting for enemy..."}
                            >
                                CONFIRM AND START GAME
                            </Button>
                        </div>
                    </div>
                }
                {gamePhase !== GamePhase.SETUP &&
                    <div className={"game-board-wrapper"}>
                        <Card size={"sm"}>
                            <div className={"game-board-card-head"}>
                                <h4>My Fleet</h4>
                                <h4>Enemy Fleet</h4>
                            </div>
                            <div className={"game-board-card-body"}>
                                <GameGridCard
                                    gridData={setupGameGrid}
                                />
                                {enemyGameGrid ?
                                    <GameGridCard
                                        gridData={enemyGameGrid}
                                        onGridPointClick={gamePhase === GamePhase.HOME_TURN ? enemyGridPointClick : () => {
                                        }}
                                        onGridPointHover={gamePhase === GamePhase.HOME_TURN ? enemyGridPointHover : () => {
                                        }}
                                        onGridPointLeave={enemyGridPointLeave}
                                        enemyGrid
                                    />
                                    :
                                    <Loader size={"lg"} color={"dark"}/>
                                }
                            </div>
                        </Card>
                        <div className={"game-actions"}>
                            <div className={"actions-group"}>
                                <Button onClick={fireRandomEnemyGamePoint}
                                        disabled={gamePhase !== GamePhase.HOME_TURN}
                                        loading={gamePhase !== GamePhase.HOME_TURN && gamePhase !== GamePhase.HOME_WINS && gamePhase !== GamePhase.AWAY_WINS}
                                        loadingText={"Waiting for enemy..."}
                                        type={"white"}>RANDOM FIRE</Button>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            color={"error"}
                                            onChange={handleChange}
                                        ></Switch>
                                    }
                                    label={"AutoShoot"}
                                    labelPlacement={"top"}
                                />
                            </div>
                        </div>
                    </div>
                }
            </Container>
            <Snackbar open={gamePhase === GamePhase.HOME_WINS || gamePhase === GamePhase.AWAY_WINS}
                      anchorOrigin={{vertical: "top", horizontal: "center"}}>
                <Alert severity={gamePhase === GamePhase.HOME_WINS ? "info" : "error"} sx={{width: '100%'}}>
                    {gamePhase === GamePhase.HOME_WINS ?
                        "Congratulations Admiral, you've won!"
                        :
                        "Your opponent has won this battle, but not the war!"
                    }
                </Alert>
            </Snackbar>
        </Background>
    )
}

export default GamePage
