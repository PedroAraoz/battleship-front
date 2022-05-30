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
    SURRENDERED = "surrendered",
}

export type GameSummary = {
    gameId: string | number,
    enemyName: string,
    result: GameResult
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
    fired: boolean
}

export enum GameGridPointType {
    WATER,
    SHIP
}

export type Ship = {
    name: string,
    size: number,
    imageUrl?: string
}