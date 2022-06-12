export type User = {
    id: number | string
    firstName: string,
    lastName: string,
    email: string,
    imageUrl?: string
}

export type AuthUser = User & {
    token: string
}

export enum GameResult {
    VICTORY = "victory",
    DEFEAT = "defeat",
    SURRENDER = "surrender"
}

export type GameSummary = {
    gameId: string | number,
    gameResult?: GameResult,
    enemyName: string
}

export type Game = GameSummary & {
    states: GameState[]
}

export type GameState = {
    myFleet: GameGrid,
    enemyFleet: GameGrid
}

export type GameGrid = {
    gridBlocks: GameGridPoint[][]
}

export type GameGridPoint = {
    type: GameGridPointType,
    fired: boolean,
    hidden: boolean,
    placingShip: boolean
    coordinates: {
        x: number,
        y: number
    }
}

export enum GameGridPointType {
    WATER = "water",
    SHIP = "ship"
}

export type Ship = {
    name: string,
    size: number,
    imageUrl?: string
}

export type SetupShip = Ship & {
    placed: boolean,
    startPos: {
        x: number,
        y: number
    }
    endPos: {
        x: number,
        y: number
    }
}

export enum ShipOrientation {
    VERTICAL,
    HORIZONTAL
}

export enum GameMessageType {
    START = "START",
    SHIP_PLACEMENT = "SHIP_PLACEMENT",
    TURN_START = "TURN_START", WAITING = "WAITING",
    SHOT = "SHOT", SHOT_RESULT = "SHOT_RESULT",
    GET_BOARD = "GET_BOARD", BOARD_DATA = "BOARD_DATA",
    GET_STATE = "GET_STATE",
    SURRENDER = "SURRENDER", WINNER = "WINNER",
}

export type BackendShip = {
    id: number
    userId: number
    size: number
    health: number
    startPos: {x: number, y: number}
    endPos: {x: number, y: number}
}

export type BackendShot = {
    id: number,
    userId: number,
    hit: boolean,
    pos: {x: number, y: number}
}