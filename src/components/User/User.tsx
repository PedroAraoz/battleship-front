import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../utils/auth"
import insignia from "../../assets/insignia.png"
import LogoutIcon from '@mui/icons-material/Logout'
import "./User.css"
import Button from "../Button/Button"

export type UserProps = {
    withSurname?: boolean
}

const User = (props: UserProps) => {
    const { withSurname } = props

    let auth = useAuth()
    let navigate = useNavigate()

    return (
        <div className="user-wrapper">
            <div className="user-chip-wrapper">
                <img src={insignia} alt={"insignia"} />
                <h3>{`ADM. ${auth.user()?.firstName} ${withSurname ? auth.user()?.lastName : ''}`}</h3>
            </div>
            <Button onClick={() => { auth.signout(() => navigate("/")) } } type={"red"}>
                <LogoutIcon/>
            </Button>
        </div>
    )
}

export default User