import React, {useEffect, useRef, useState} from "react"
import {Navigate, useLocation, useNavigate} from "react-router-dom"
import Background from "../../components/Background/Background"
import Card from "../../components/Card/Card"
import Loader from "../../components/Loader/Loader"
import Message from "../../components/Message/Message"
import {useAuth} from "../../utils/auth"
import "./LoginPage.css"
import {post} from "../../utils/fetch"

type LocationProps = {
    state: { from: Location }
}

const LoginPage = () => {
    let navigate = useNavigate()
    let location = useLocation() as unknown as LocationProps
    let auth = useAuth()
    let googleButton = useRef(null)

    let [isLoading, setIsLoading] = useState(false)

    const from = location.state?.from?.pathname || "/home"

    useEffect(() => {
        if (googleButton.current) {
            (window as any).google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });
            (window as any).google.accounts.id.renderButton(googleButton.current, {type: 'standard'});
            (window as any).google.accounts.id.prompt();
        }
    }, [googleButton.current])

    function handleCredentialResponse(response: any) {
        setIsLoading(true)
        if (!!response) {
            const body = { idToken: response.credential }
            post("user/login", null, JSON.stringify(body))
                .then(data => {auth.signin({...data, token: body.idToken}, () => {
                        navigate(from, { replace: true })
                })})
        }
    }

    return !!auth.user() ? (
        <Navigate to={from} state={{ from: location }} replace />
    ) : (
        <Background fullscreen>
            {isLoading ?
                <Loader size={"lg"} color={"light"} />
                :
                <Card size="lg" raised transparent>
                    <Message messages={[{id: "login-message-1", message: "Please login with your Google account to start playing!"}]} />
                    <div ref={googleButton} />
                </Card>
            }
        </Background>
    )
}

export default LoginPage
