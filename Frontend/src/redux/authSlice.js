import {createSlice} from "@reduxjs/toolkit";
import { act } from "react";

const initialState= {
    user: null,
    token: null
}

export const userSlice= createSlice({
    name: "user",
    initialState,
    reducers: {
        setlogin: (state, action) => {
            state.user= action.payload.user
            state.token= action.payload.token
        },
        setLogout: (state, action) => {
            state.user= null
            state.token= null
        }
    }
})

export const {setlogin, setLogout}= userSlice.actions
export default userSlice.reducer