'use client'
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {FC, PropsWithChildren} from "react";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
})

const MuiProvider: FC<PropsWithChildren> = ({children}) => {
    return (
        <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {children}
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default MuiProvider;