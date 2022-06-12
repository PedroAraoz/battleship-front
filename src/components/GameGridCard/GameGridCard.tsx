import React from "react"
import {GameGrid} from "../../models"
import "./GameGridCard.css"

type GameGridProps = {
    gridData: GameGrid,
    enemyGrid?: boolean,
    onGridPointClick?: (i, j) => void,
    onGridPointHover?: (i, j) => void,
    onGridPointLeave?: () => void,
}

const GameGridCard = (props: GameGridProps) => {
    const {gridData, enemyGrid, onGridPointClick, onGridPointHover, onGridPointLeave} = props

    return gridData && (
        <div className={"game-grid"}>
            <div className={"coordinates-x"}>
                <h4 />
                {Array.from(Array(gridData.gridBlocks.length)).map((a, i) => {
                    return <h4 key={`coordinates-x-${i}`}>{String.fromCharCode(65 + (i % 26))} </h4>
                })}
            </div>
            {gridData && gridData.gridBlocks.map((row, i) => {
                return (
                    <div key={`grid-row-${i}`} className={"grid-row"}>
                        <h4>{i + 1}</h4>
                        {row.map((p, j) => {
                            return (
                                <div key={`grid-point-${i}-${j}`}
                                     onClick={onGridPointClick ? () => onGridPointClick(i, j) : () => {}}
                                     onMouseOver={onGridPointHover ? () => onGridPointHover(i, j) : () => {}}
                                     onMouseLeave={onGridPointLeave ? () => onGridPointLeave() : () => {}}
                                     className={`grid-point ${!enemyGrid || p.fired ? p.type : ""}${p.fired ? " fired" : ""}${p.hidden ? " hidden": ""}${p.placingShip ? " placing" : ""}`} >
                                    {p.fired && <span role="img" aria-label="fire">💥</span>}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

export default GameGridCard