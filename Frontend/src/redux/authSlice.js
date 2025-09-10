import {createSlice} from "@reduxjs/toolkit";

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
        },
        setListings: (state, action) => {
            state.listings= action.payload.listings
        }
    }
})

export const {setlogin, setLogout, setListings}= userSlice.actions
export default userSlice.reducer