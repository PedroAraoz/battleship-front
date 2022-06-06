import React from "react"
import {useNavigate} from "react-router-dom"
import Background from "../../components/Background/Background"
import Card from "../../components/Card/Card"
import Message from "../../components/Message/Message"
import Button from "../../components/Button/Button"

function NotFoundPage() {
    let navigate = useNavigate();

    return (
        <Background>
            <Card size={"lg"}>
                <Message messages={[
                    { id: "not-found-message-1", message: "404 Error!" },
                    { id: "not-found-message-2", message: "We couldn't find the page you were looking for." }
                ]} />
                <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
                    <Button onClick={() => {navigate(-1)}} type={"blue"}>
                        GO BACK
                    </Button>
                </div>
            </Card>
        </Background>
    )
}

export default NotFoundPage