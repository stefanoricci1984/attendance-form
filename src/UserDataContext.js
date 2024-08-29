import React, { createContext, useState } from "react";
export const UserDataContext = createContext();
export const UserDataProvider = ({ children }) => {
    const [userData, setUserData] = useState([]);

    const addUserData = (data) => {
        setUserData((prevData) => [...prevData, data]);
    };

    return (
        <UserDataContext.Provider value={{ userData, addUserData }}>
            {children}
        </UserDataContext.Provider>
    );
};