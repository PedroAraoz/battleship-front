import {Accordion, AccordionDetails, AccordionSummary} from "@mui/material"
import {ExpandMore} from "@mui/icons-material"
import React, {useState} from "react"
import {GameState, GameSummary} from "../../models"
import "./GameCard.css"
import GameGridCard from "../GameGridCard/GameGridCard"
import {get} from "../../utils/fetch";
import {useAuth} from "../../utils/auth";

export type GameProps = {
    summary: GameSummary,
    lastGameState: GameState
}

const GameCard = (props: GameProps) => {
    let auth = useAuth()

    const { summary, lastGameState } = props

    const [expanded, setExpanded] = React.useState<string | false>(false);

    const [enemyName, setEnemyName] = useState("Enemy")

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };
    useState(() => {
        get(`user/${summary.enemyId}`, auth.user().token).then(data => {
            const enemyName = data.firstName + " " + data.lastName
            setEnemyName(enemyName)
        })
    })

    return (
        <div className="game-card-wrapper">
            <Accordion style={{"boxShadow": "none"}} expanded={expanded === `${summary.gameId}`} onChange={handleChange(`${summary.gameId}`)}>
                <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`${summary.gameId}-content`} id={`${summary.gameId}-header`}>
                    <div className="game-card-summary-wrapper">
                        <h4>Against{` ${enemyName}`}{` on the ${summary.gameDate}`}</h4>
                        <div className={`game-card-summary-result-wrapper ${summary.gameResult}`}>
                            <h4>{summary.gameResult}</h4>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="game-card-details-wrapper">
                        <div>
                            <h4>My Fleet</h4>
                            <GameGridCard gridData={lastGameState.myFleet} />
                        </div>
                        <div>
                            <h4>Enemy Fleet</h4>
                            <GameGridCard gridData={lastGameState.enemyFleet} />
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default GameCard