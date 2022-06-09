export type User = {
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
}

export type GameSummary = {
    gameId: string | number,
    enemy: User,
    result?: GameResult
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
    placed: boolean
}

export enum ShipOrientation {
    VERTICAL,
    HORIZONTAL
}