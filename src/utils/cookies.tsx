export function setCookie(name: string, value: string, seconds: number) {
    const d = new Date()
    d.setTime(d.getTime() + (seconds * 1000))
    let expires = "expires=" + d.toUTCString()
    document.cookie = name + "=" + value + ";" + expires + ";path=/"
}

export function getCookie(name: string) {
    const cname = name + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length)
        }
    }
    return ""
}