import React from "react"
import {useAuth} from "./auth";

// let auth = useAuth()
// let token = auth.user.arguments.token
const token = 'pedro@mail.com';


const request = (path: string, method: string) => {
    return fetch(`${process.env.REACT_APP_SERVER_URL}/${path}`, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .catch(error => console.log("error:", error));

}

export const get = (path: string) => request(path, 'GET');
export const post = (path: string) => request(path, 'POST');