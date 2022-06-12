import React from "react"
import {Navigate, useLocation} from "react-router-dom"
import {AuthUser} from "../models"

const myAuthProvider = {
    signin(callback: VoidFunction) {
        setTimeout(callback, 100)
    },
    signout(callback: VoidFunction) {
        setTimeout(callback, 100)
    },
}

interface AuthContextType {
    user: () => AuthUser | undefined
    signin: (user: AuthUser, callback: VoidFunction) => void
    signout: (callback: VoidFunction) => void
}

let AuthContext = React.createContext<AuthContextType>(null!)

function AuthProvider({ children }: { children: React.ReactNode }) {
    let user = (): AuthUser | undefined => {
        if (window.sessionStorage.getItem("token") 
        && window.sessionStorage.getItem("id")
        && window.sessionStorage.getItem("firstName")
        && window.sessionStorage.getItem("lastName")
        && window.sessionStorage.getItem("email")
        && window.sessionStorage.getItem("imageUrl")) {
            return {
                token: window.sessionStorage.getItem("token") as string,
                id: window.sessionStorage.getItem("id") as string,
                firstName: window.sessionStorage.getItem("firstName") as string,
                lastName: window.sessionStorage.getItem("lastName") as string,
                email: window.sessionStorage.getItem("email") as string,
                imageUrl: window.sessionStorage.getItem("imageUrl") as string,
            }
        }
        return undefined
    }

    let signin = (newUser: AuthUser, callback: VoidFunction) => {
        return myAuthProvider.signin(() => {
            window.sessionStorage.setItem("token", newUser.token)
            window.sessionStorage.setItem("id", `${newUser.id}`)
            window.sessionStorage.setItem("firstName", newUser.firstName)
            window.sessionStorage.setItem("lastName", newUser.lastName)
            window.sessionStorage.setItem("email", newUser.email)
            window.sessionStorage.setItem("imageUrl", newUser.imageUrl ? newUser.imageUrl : "")
            callback()
        })
    }

    let signout = (callback: VoidFunction) => {
        return myAuthProvider.signout(() => {
            window.sessionStorage.removeItem("token")
            window.sessionStorage.removeItem("id")
            window.sessionStorage.removeItem("firstName")
            window.sessionStorage.removeItem("lastName")
            window.sessionStorage.removeItem("email")
            window.sessionStorage.removeItem("imageUrl")
            callback()
        })
    }

    let value = { user, signin, signout }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
    return React.useContext(AuthContext)
}

function RequireAuth({ children }: { children: JSX.Element }) {
    let auth = useAuth()
    let location = useLocation()

    if (!auth.user()) {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    return children
}

export { AuthProvider, RequireAuth, useAuth }