import {BackendShip, BackendShot, GameGrid as Grid, GameGridPoint, GameGridPointType, SetupShip} from "../models"

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

export function overlapsShipHorizontally(i, j, setupGameGrid, setupShipSelected) {
    let overlaps = false
    for (let n = j; n < j + setupShipSelected.size; n++) {
        if (setupGameGrid.gridBlocks[i][n].type === GameGridPointType.SHIP) overlaps = true
    }
    return overlaps
}

export function overlapsShipVertically(i, j, setupGameGrid, setupShipSelected) {
    let overlaps = false
    for (let n = i; n < i + setupShipSelected.size; n++) {
        if (setupGameGrid.gridBlocks[n][j].type === GameGridPointType.SHIP) overlaps = true
    }
    return overlaps
}

export function setRandomGameGrid(setupShips: SetupShip[], placedShips: SetupShip[], setupGameGrid, setSetupShips, setSetupGameGrid) {
    if (placedShips.length === setupShips.length) {
        setSetupShips([...placedShips])
        setSetupGameGrid({...setupGameGrid})
        return
    }

    let shipToPlace = {...setupShips[placedShips.length]}

    let startX;
    let startY;
    let endX;
    let endY;

    while(!shipToPlace.placed) {
        if (Math.random() > .5) {
            // try placing vertically first
            startX = Math.floor(Math.random() * 10)
            startY = Math.floor(Math.random() * (10 - shipToPlace.size))
            endX = startX
            endY = startY + shipToPlace.size - 1
            if (!overlapsShipVertically(startY, startX, setupGameGrid, shipToPlace)) {
                for (let n = 0; n < shipToPlace.size; n++) {
                    let gridBlockPoint = setupGameGrid.gridBlocks[startY + n][startX]
                    setupGameGrid.gridBlocks[startY + n][startX] = {...gridBlockPoint, type: GameGridPointType.SHIP}
                }
                placedShips.push({...shipToPlace,
                    placed: true,
                    startPos: {x: startX, y: startY},
                    endPos: {x: endX, y: endY}
                })
                shipToPlace.placed = true
            }
        } else {
            // try placing horizontally first
            startX = Math.floor(Math.random() * (10 - shipToPlace.size))
            startY = Math.floor(Math.random() * 10)
            endX = startX + shipToPlace.size - 1
            endY = startY
            if (!overlapsShipHorizontally(startY, startX, setupGameGrid, shipToPlace)) {
                for (let n = 0; n < shipToPlace.size; n++) {
                    let gridBlockPoint = setupGameGrid.gridBlocks[startY][startX + n]
                    setupGameGrid.gridBlocks[startY][startX + n] = {...gridBlockPoint, type: GameGridPointType.SHIP}
                }
                placedShips.push({...shipToPlace,
                    placed: true,
                    startPos: {x: startX, y: startY},
                    endPos: {x: endX, y: endY}
                })
                shipToPlace.placed = true
            }
        }
    }

    setRandomGameGrid(setupShips, placedShips, setupGameGrid, setSetupShips, setSetupGameGrid)

}
