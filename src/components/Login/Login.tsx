import React from "react";

export type LoginState = {
    profile?: Profile
}

export type Profile = {
    id: string
}

export type LoginProps = {}

export default class GoogleLogin extends React.Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {profile: undefined}
    }

    render() {

        const onSignIn = (googleUser: any) => {
            var profile = googleUser.getBasicProfile();
            console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
            console.log('Name: ' + profile.getName());
            console.log('Image URL: ' + profile.getImageUrl());
            console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
            this.setState({profile: {id: profile.getId()}})
        }

        const signOut = () => {
            // @ts-ignore
            var auth2 = window.gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        }

        return (
            <div>
                {this.state.profile ?
                    <a href="#" onClick={signOut}>Sign out</a>
                    :
                    <div className="g-signin2" data-onsuccess={onSignIn}></div>
                }
            </div>
        )
    }
}