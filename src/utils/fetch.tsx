const request = (path: string, method: string, token?: string, body?: string) => {
    let requestInit: RequestInit = body ? {
        method: method,
        headers: {
            'Content-type': 'application/json',
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: body
    } : {
        method: method,
        headers: {
            'Content-type': 'application/json',
            Authorization: token ? `Bearer ${token}` : "",
        }
    }

    return fetch(`${process.env.REACT_APP_SERVER_URL}/${path}`, requestInit)
        .then(response => {
            if (response.status !== 200) throw new Error(`Error while fetching: ${path}`)
            else return response.json()
        })
}

export const get = (path: string, token?: string) => request(path, 'GET', token);
export const post = (path: string, token?: string, body?: string) => request(path, 'POST', token, body);