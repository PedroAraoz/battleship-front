import React from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { User } from "../models"

const myAuthProvider = {
  isAuthenticated: false,
  signin(callback: VoidFunction) {
    myAuthProvider.isAuthenticated = true
    setTimeout(callback, 100)
  },
  signout(callback: VoidFunction) {
    myAuthProvider.isAuthenticated = false
    setTimeout(callback, 100)
  },
}

interface AuthContextType {
  user: User
  signin: (user: User, callback: VoidFunction) => void
  signout: (callback: VoidFunction) => void
}

let AuthContext = React.createContext<AuthContextType>(null!)

function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = React.useState<any>(undefined) // TODO on state init, get user from cookies if it exists

  let signin = (newUser: User, callback: VoidFunction) => {
    return myAuthProvider.signin(() => {
      setUser(newUser)
      callback()
    })
  }

  let signout = (callback: VoidFunction) => {
    return myAuthProvider.signout(() => {
      setUser(null)
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

  if (!auth.user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

// function AuthStatus() {
//   let auth = useAuth();
//   let navigate = useNavigate();

//   if (!auth.user) {
//     return <p>You are not logged in.</p>;
//   }

//   return (
//     <p>
//       Welcome {auth.user}!{" "}
//       <button
//         onClick={() => {
//           auth.signout(() => navigate("/"));
//         }}
//       >
//         Sign out
//       </button>
//     </p>
//   );
// }

export { AuthProvider, RequireAuth, useAuth }