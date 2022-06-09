import React, {useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from "stompjs"
import {get} from "../../utils/fetch"
import {Game, GameGrid as Grid, GameGridPoint, GameGridPointType, SetupShip, ShipOrientation} from "../../models"
import Background from "../../components/Background/Background"
import {Container} from "@mui/material"
import User from "../../components/User/User"
import Button from "../../components/Button/Button"
import Card from "../../components/Card/Card"
import "./GamePage.css"
import GameGridCard from "../../components/GameGridCard/GameGridCard"
import {useAuth} from "../../utils/auth"
import {ControlCamera} from "@mui/icons-material"

const GRID_SIZE = 10

const ships: SetupShip[] = [
    {name: 'Carrier', size: 5, placed: false},
    {name: 'Battleship', size: 4, placed: false},
    {name: 'Cruiser', size: 3, placed: false},
    {name: 'Submarine', size: 3, placed: false},
    {name: 'Destroyer', size: 2, placed: false}
]

enum GamePhase {
    SETUP,
    HOME_TURN,
    AWAY_TURN,
    FINISHED
}

const GamePage = () => {
    let navigate = useNavigate()
    let auth = useAuth()

    let {gameId} = useParams() // TODO if gameId doesn't correspond to an ongoing game involving the logged in user, redirect to not found

    let [game, setGame] = useState<Game>()
    let [gamePhase, setGamePhase] = useState(getGamePhase()) // TODO get game phase on construction

    let [setupGameGrid, setSetupGameGrid] = useState(getCleanGameGrid())
    let [setupGameShips, setSetupGameShips] = useState(ships)
    let [setupShipOrientation, setSetupShipOrientation] = useState<ShipOrientation>(ShipOrientation.HORIZONTAL)
    let [setupShipSelected, setSetupShipSelected] = useState<SetupShip>()

    let [enemyGameGrid, setEnemyGameGrid] = useState(getCleanGameGrid())
    let [selectedEnemyGamePoint, setSelectedEnemyGamePoint] = useState<GameGridPoint>(undefined)

    let [stompClient, setStompClient] = useState(null)
    let [messages, setMessages] = useState([])
    let [sub, setSub] = useState(null)
    let [message, setMessage] = useState('')

    useEffect(() => {
        connectWebSocket()
    }, [])

    useEffect(() => {
        if (stompClient) checkIfGameStarted()
    }, [stompClient])

    function connectWebSocket() {
        const socket = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`)
        let a = Stomp.over(socket)
        a.connect({}, function () {
            setStompClient(a)
        })
    }

    function onMessageReceived(msg) {
        console.log('message recieved:', msg.body)
        messages.push(JSON.parse(msg.body))
        setMessages(messages)
    }

    function checkIfGameStarted() {
        get(`game/started/${gameId}`, auth.user().token).then(data => {(data.res === 'true') ? loadGame() : joinGame()})
    }

    function loadGame() {
        get(`game/${gameId}`).then(data => {
                setGame(data);
                setMessages(data.messages)
        })
    }

    function joinGame() {
        setSub(stompClient.subscribe(`/queue/messages/${gameId}`, onMessageReceived)) //TODO add /userId
    }

    function getGamePhase() {
        // TODO get game phase logic
        return GamePhase.SETUP
    }

    function goHome() {
        navigate("/home", {replace: true})
    }

    function surrender() {
        // TODO surrender logic
        navigate("/home")
    }

    function getCleanGameGrid(): Grid {
        let gridBlocks: GameGridPoint[][] = []
        for (let i = 0; i < GRID_SIZE; i++) {
            gridBlocks.push([])
            for (let j = 0; j < GRID_SIZE; j++) {
                gridBlocks[i].push({
                    type: GameGridPointType.WATER,
                    fired: false,
                    hidden: false,
                    placingShip: false,
                    coordinates: {
                        x: j,
                        y: i
                    }
                })
            }
        }
        return {gridBlocks: gridBlocks}
    }

    function renderShipBlocks(s: SetupShip) {
        let blocks = []
        for (let i = 0; i < s.size; i++) {
            blocks.push(<div key={`${s.name}-block-${i}`} className={"ship-block"}></div>)
        }
        return blocks
    }

    function randomizeSetupGrid() {
        let placedShips = setupGameShips.filter(s => s.placed)
        if (placedShips.length === 0 || placedShips.length === setupGameShips.length) {
            let ships = [...setupGameShips]
            ships.forEach(s => {
                setSetupShipSelected(s)
                let i = Math.floor(Math.random() * 10)
                let j = Math.floor(Math.random() * 10)
                let placing = onGridPointHover(i, j)
                while (!placing) {
                    i = Math.floor(Math.random() * 10)
                    j = Math.floor(Math.random() * 10)
                    placing = onGridPointHover(i, j)
                    console.log(placing)
                }
                onGridPointClick(i, j)
            })
        } else {

        }
    }

    function resetSetupGrid() {
        setSetupGameShips(ships)
        setSetupGameGrid(getCleanGameGrid())
    }

    function confirmSetupGrid() {
        setGamePhase(GamePhase.HOME_TURN)
    }

    function changeSetupShipOrientation() {
        setSetupShipOrientation(setupShipOrientation === ShipOrientation.HORIZONTAL ?
            ShipOrientation.VERTICAL : ShipOrientation.HORIZONTAL)
    }

    function onGridPointClick(i, j) {
        if(setupShipSelected && !setupShipSelected.placed) {
            let auxGridData = {gridBlocks: [...setupGameGrid.gridBlocks]}
            let placedShip = false
            for (let i = 0; i < setupGameGrid.gridBlocks.length; i++) {
                for (let j = 0; j < setupGameGrid.gridBlocks.length; j++) {
                    let gamePoint = auxGridData.gridBlocks[i][j]
                    if (gamePoint.placingShip) {
                        gamePoint.type = GameGridPointType.SHIP
                        placedShip = true
                    }
                }
            }
            if (placedShip) {
                let auxSetupShips = [...setupGameShips]
                auxSetupShips[setupGameShips.indexOf(setupShipSelected)] = {...setupShipSelected, placed: true}
                setSetupGameShips(auxSetupShips)
                setSetupShipSelected({...setupShipSelected, placed: true})
            }
            setSetupGameGrid(auxGridData)
        }
    }

    function overlapsShipHorizontally(i, j) {
        let overlaps = false
        for (let n = j; n < j + setupShipSelected.size; n++) {
            if (setupGameGrid.gridBlocks[i][n].type === GameGridPointType.SHIP) overlaps = true
        }
        return overlaps
    }

    function overlapsShipVertically(i, j) {
        let overlaps = false
        for (let n = i; n < i + setupShipSelected.size; n++) {
            if (setupGameGrid.gridBlocks[n][j].type === GameGridPointType.SHIP) overlaps = true
        }
        return overlaps
    }

    function onGridPointHover(i, j): boolean {
        let auxGridData = {gridBlocks: [...setupGameGrid.gridBlocks]}
        let placing = false
        if (setupShipSelected && !setupShipSelected.placed) {
            let gridSize = auxGridData.gridBlocks.length
            if (setupShipOrientation === ShipOrientation.HORIZONTAL) {
                if (j + setupShipSelected.size <= gridSize) {
                    if (!overlapsShipHorizontally(i, j)) {
                        for (let n = 0; n < setupShipSelected.size; n++) {
                            auxGridData.gridBlocks[i][j + n].placingShip = true
                            placing = true
                        }
                    }
                }
            } else {
                if (i + setupShipSelected.size <= gridSize) {
                    if (!overlapsShipVertically(i, j)) {
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

    function onGridPointLeave() {
        let auxGridData = {gridBlocks: [...setupGameGrid.gridBlocks]}
        for (let i = 0; i < setupGameGrid.gridBlocks.length; i++) {
            for (let j = 0; j < setupGameGrid.gridBlocks.length; j++) {
                auxGridData.gridBlocks[i][j].placingShip = false
            }
        }
        setSetupGameGrid(auxGridData)
    }

    function onEnemyGridPointClick(i, j) {
        setSelectedEnemyGamePoint(enemyGameGrid.gridBlocks[i][j])
    }

    function onEnemyGridPointHover(i, j) {
        let auxGridData = {gridBlocks: [...enemyGameGrid.gridBlocks]}
        auxGridData.gridBlocks[i][j].placingShip = true
        setEnemyGameGrid(auxGridData)
    }

    function onEnemyGridPointLeave() {
        let auxGridData = {gridBlocks: [...enemyGameGrid.gridBlocks]}
        for (let i = 0; i < setupGameGrid.gridBlocks.length; i++) {
            for (let j = 0; j < setupGameGrid.gridBlocks.length; j++) {
                auxGridData.gridBlocks[i][j].placingShip = false
            }
        }
        setEnemyGameGrid(auxGridData)
    }

    function fireSelectedEnemyGamePoint() {
        let auxGridData = {gridBlocks: [...enemyGameGrid.gridBlocks]}
        let i = selectedEnemyGamePoint.coordinates.y
        let j = selectedEnemyGamePoint.coordinates.x
        auxGridData.gridBlocks[i][j].fired = true
        setEnemyGameGrid(auxGridData)
    }

    function fireRandomEnemyGamePoint() {
        let auxGridData = {gridBlocks: [...enemyGameGrid.gridBlocks]}
        let i = Math.floor(Math.random() * 10)
        let j = Math.floor(Math.random() * 10)
        while (auxGridData.gridBlocks[i][j].fired) {
            i = Math.floor(Math.random() * 10)
            j = Math.floor(Math.random() * 10)
        }
        auxGridData.gridBlocks[i][j].fired = true
        setEnemyGameGrid(auxGridData)
    }

    return (
        <Background>
            <Container>
                <div className="actions">
                    <User />
                    {gamePhase === GamePhase.FINISHED ?
                        <Button onClick={goHome} type={"blue"}>GO BACK HOME</Button>
                        :
                        <Button onClick={surrender} type={"red"}>SURRENDER</Button>
                    }
                </div>
                {(gamePhase === GamePhase.SETUP) &&
                    <div className={"game-board-wrapper"}>
                        <Card size={"sm"}>
                            <div className={"game-board-card-head"}>
                                <h4>Fleet Deployment</h4>
                                {/*<div className={"time"}>
                                    <Alarm fontSize={"small"} /><h4>Time Left: --:--</h4>
                                </div>*/}
                            </div>
                            <div className={"game-board-card-body"}>
                                <GameGridCard
                                    gridData={setupGameGrid}
                                    onGridPointClick={onGridPointClick}
                                    onGridPointHover={onGridPointHover}
                                    onGridPointLeave={onGridPointLeave}/>
                                <div className={"game-ships"}>
                                    {setupGameShips.map((s, i) => {
                                        return (
                                            <div className={`ship-wrapper${s.placed ? " placed" : ""}${setupShipSelected === s ? " selected" : ""}`}
                                                 onClick={() => {if(!s.placed) setSetupShipSelected(s)}}
                                                 key={`${s.name}-${i}`}
                                            >
                                                <h4>{s.name}</h4>
                                                {renderShipBlocks(s)}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </Card>
                        <div className={"game-actions"}>
                            <div className={"actions-group"}>
                                <Button onClick={changeSetupShipOrientation} type={"white"}>CHANGE SHIP ORIENTATION</Button>
                                <Button onClick={resetSetupGrid} type={"white"}>RESET GRID</Button>
                                <Button onClick={randomizeSetupGrid} type={"white"} disabled>RANDOMIZE</Button>
                            </div>
                            <Button onClick={confirmSetupGrid} type={"blue"}
                                    disabled={setupGameShips.filter(s => s.placed === false).length > 0}>CONFIRM AND START GAME</Button>
                        </div>
                    </div>
                }
                {(gamePhase !== GamePhase.SETUP) &&
                    <div className={"game-board-wrapper"}>
                        <Card size={"sm"}>
                            <div className={"game-board-card-head"}>
                                <h4>My Fleet</h4>
                                {/*<div className={"time"}>
                                    <Alarm fontSize={"small"} /><h4>Time Left: --:--</h4>
                                </div>*/}
                                <h4>Enemy Fleet</h4>
                            </div>
                            <div className={"game-board-card-body"}>
                                <GameGridCard
                                    gridData={setupGameGrid}
                                    onGridPointClick={onGridPointClick}
                                    onGridPointHover={onGridPointHover}
                                    onGridPointLeave={onGridPointLeave}/>
                                <GameGridCard
                                    gridData={enemyGameGrid}
                                    onGridPointClick={onEnemyGridPointClick}
                                    onGridPointHover={onEnemyGridPointHover}
                                    onGridPointLeave={onEnemyGridPointLeave}
                                    enemyGrid
                                />
                            </div>
                        </Card>
                        <div className={"game-actions"}>
                            <div className={"actions-group"}>
                                <Button onClick={fireRandomEnemyGamePoint} type={"white"}>RANDOM FIRE</Button>
                            </div>
                            <Button onClick={fireSelectedEnemyGamePoint} type={"blue"}
                                    disabled={!selectedEnemyGamePoint}><ControlCamera/></Button>
                        </div>
                    </div>
                }
            </Container>
        </Background>
    )
}

export default GamePage

// const handleClick = event => {
//     event.preventDefault()
//     let obj = {
//         gameId: gameId,
//         content: message,
//         token: `Bearer ${auth.user().token}`
//     }
//     stompClient.send("/app/game", {}, JSON.stringify(obj))
//     setMessage('')
// };