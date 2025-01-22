'use client'
import { createContext, useState, useContext } from "react";

const AppContext = createContext();

export function AppWrapper({ children }) {
    const [isClicked, setIsClicked] = useState(false);

    return (
        <AppContext.Provider value={{ isClicked, setIsClicked }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
