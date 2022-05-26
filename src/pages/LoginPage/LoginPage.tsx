import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Background from "../../components/Background/Background"
import Card from "../../components/Card/Card"
import Loader from "../../components/Loader/Loader"
import Message from "../../components/Message/Message"
import { useAuth } from "../../utils/auth"
import "./LoginPage.css"

type LocationProps = {
    state: {
        from: Location;
    };
};

const LoginPage = () => {
    let navigate = useNavigate()
    let location = useLocation() as unknown as LocationProps
    let auth = useAuth()

    const [isLoading, setIsLoading] = useState(false)

    const clientId = "64992691436-bfdvk9u682iut84mk1f9kvbll44u5dqt.apps.googleusercontent.com"

    const from = location.state?.from?.pathname || "/home"
    const message = "Please login with your Google account to start playing!"

    function handleCredentialResponse(response: any) {
        setIsLoading(false)
        if (!!response) {
            const payload = { idToken: response.credential };
            fetch(`${process.env.REACT_APP_SERVER_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    auth.signin(response, () => {
                        navigate(from, { replace: true })
                    })
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }

    useEffect(() => {
        (window as any).handleCredentialResponse = handleCredentialResponse;
    }, [])

    return (
        <Background fullscreen>
            {isLoading ?
                <Loader size={"lg"} color={"light"} />
                :
                <Card size="lg" raised transparent>
                    <Message message={message} />
                    <div id="g_id_onload"
                        data-client_id={clientId}
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
