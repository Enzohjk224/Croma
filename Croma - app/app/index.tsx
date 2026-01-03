import {Text, View, } from "react-native";
import {useEffect, } from "react";
import Login from "./stacks/Login";
import { useRouter } from "expo-router";

export default function Index(){
const router = useRouter();

useEffect(() => {
    const timeout = setTimeout(() => {
        const isLoggedIn = false;

        if (isLoggedIn) {
            router.navigate("/tabs/Principal")
        } else {
            return <Login/>;
        }

    }, 1000)
}, [])

    return <Login />;
}