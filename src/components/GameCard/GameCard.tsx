import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material"
import { ExpandMore, Stars } from "@mui/icons-material"
import React from "react"
import { GameState, GameSummary } from "../../models"
import "./GameCard.css"

export type GameProps = {
    summary: GameSummary,
    lastGameState: GameState
}

const GameCard = (props: GameProps) => {
    const { summary, lastGameState } = props

    const [expanded, setExpanded] = React.useState<string | false>(false);

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    return (
        <div className="game-card-wrapper">
            <Accordion style={{"boxShadow": "none"}} expanded={expanded === `${summary.gameId}`} onChange={handleChange(`${summary.gameId}`)}>
                <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`${summary.gameId}-content`} id={`${summary.gameId}-header`}>
                    <div className="game-card-summary-wrapper">
                        <h4>{summary.enemyName}</h4>
                        <div className={`game-card-summary-result-wrapper ${summary.result}`}>
                            <h4>{summary.result}</h4>
                            <Stars/>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="game-card-details-wrapper">
                        {/* TODO render last game states (game grids) */}
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default GameCard