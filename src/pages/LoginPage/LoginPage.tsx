import React, { useEffect, useState } from "react"
import GoogleLogin from 'react-google-login'
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

    let from = location.state?.from?.pathname || "/home"
    let message = "Please login with your Google account to start playing!"

    const googleSuccess = (response: any) => {
        setIsLoading(false)
        console.log(response)
        if (!!response) {
            auth.signin(response, () => {
                navigate(from, { replace: true })
            })
        }
    }

    const googleRequest = () => {
        setIsLoading(true)
    }

    const googleFailure = (response: any) => {
        setIsLoading(false)
        console.log(response)
    }

    return (
        <Background fullscreen>
            {isLoading ?
                <Loader size={"lg"} color={"light"} />
                :
                <Card size="lg" raised transparent>
                    <Message message={message} />
                    <GoogleLogin
                        clientId="64992691436-bfdvk9u682iut84mk1f9kvbll44u5dqt.apps.googleusercontent.com"
                        onSuccess={googleSuccess}
                        onRequest={googleRequest}
                        onFailure={googleFailure}
                        cookiePolicy={'single_host_origin'}
                        isSignedIn
                    />
                </Card>
            }
        </Background>
    )
}

export default LoginPage
