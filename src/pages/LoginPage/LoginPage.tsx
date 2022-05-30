import React, { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import Background from "../../components/Background/Background"
import Card from "../../components/Card/Card"
import Loader from "../../components/Loader/Loader"
import Message from "../../components/Message/Message"
import { useAuth } from "../../utils/auth"
import "./LoginPage.css"

type LocationProps = {
    state: { from: Location }
}

const LoginPage = () => {
    let navigate = useNavigate()
    let location = useLocation() as unknown as LocationProps
    let auth = useAuth()

    let [isLoading, setIsLoading] = useState(false)

    const from = location.state?.from?.pathname || "/home"

    function handleCredentialResponse(response: any) {
        setIsLoading(true)
        if (!!response) {
            const payload = { idToken: response.credential }
            fetch(`${process.env.REACT_APP_SERVER_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                    auth.signin(data, () => {
                        navigate(from, { replace: true })
                    })
                })
                .catch((error) => {
                    console.error('Error:', error)
                    setIsLoading(false)
                })
        }
    }

    useEffect(() => {
        (window as any).handleCredentialResponse = handleCredentialResponse
    }, [])

    return !!auth.user() ? (
        <Navigate to="/home" state={{ from: location }} replace />
    ) : (
        <Background fullscreen>
            {isLoading ?
                <Loader size={"lg"} color={"light"} />
                :
                <Card size="lg" raised transparent>
                    <Message messages={[{id: "login-message-1", message: "Please login with your Google account to start playing!"}]} />
                    <div id="g_id_onload"
                        data-client_id={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        data-callback={"handleCredentialResponse"}>
                    </div>
                    <div className="g_id_signin"
                        data-type="standard" />
                </Card>
            }
        </Background>
    )
}

export default LoginPage
