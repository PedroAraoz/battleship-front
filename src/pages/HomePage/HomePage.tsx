import React from "react";
import Background from "../../components/Background/Background";
import Loader from "../../components/Loader/Loader";

const AnotherPage = () => {
    return (
        <Background>
            <Loader size={"lg"} color={"dark"}/>
        </Background>
    )
}
export default AnotherPage