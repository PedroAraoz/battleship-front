import {BackendShip, BackendShot, GameGrid as Grid, GameGridPoint, GameGridPointType} from "../models"

export const GRID_SIZE = 10

export function getGameGrid(ships?: BackendShip[], shots?: BackendShot[]): Grid {
    let gridBlocks: GameGridPoint[][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
        gridBlocks.push([])
        for (let j = 0; j < GRID_SIZE; j++) {
            gridBlocks[i].push({
                type: GameGridPointType.WATER,
                fired: false,
                hidden: false,
                placingShip: false,
                coordinates: {x: j, y: i}
            })
        }
    }
    if (ships) {
        ships.forEach(s => {
            const startX = s.startPos.x
            const startY = s.startPos.y
            const endX = s.endPos.x
            const endY = s.endPos.y
            for (let n = 0; n < s.size; n++) {
                if (startX === endX) {
                    let gridPoint = gridBlocks[startY + n][startX]
                    gridBlocks[startY + n][startX] =
                        {...gridPoint, type: GameGridPointType.SHIP}
                } else {
                    let gridPoint = gridBlocks[startY][endX + n]
                    gridBlocks[startY][startX + n] =
                        {...gridPoint, type: GameGridPointType.SHIP}
                }
            }
        })
    }
    if (shots) {
        shots.forEach(s => {
            const y = s.pos.y
            const x = s.pos.x
            let gridPoint = gridBlocks[y][x]
            gridBlocks[y][x] = {
                ...gridPoint,
                fired: true,
                type: s.hit ? GameGridPointType.SHIP : GameGridPointType.WATER
            }
        })
    }
    return {gridBlocks: gridBlocks}
}