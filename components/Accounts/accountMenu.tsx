"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import CardMedia from "@mui/material/CardMedia";
import Tooltip from "@mui/material/Tooltip";
import { AuthPage } from "./auth-page";
// import { monitorAuthState } from "@/services/firebase/auth";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AccountPage from "./account-page";

import { useUser } from "@clerk/nextjs";

const darkTheme = createTheme({
  palette: {
    mode: "dark"
  }
});

export default function AccountMenu() {
  const { user: userDetails } = useUser();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [user, setUser] = React.useState<any>(null);
  const [image, setImage] = React.useState<string>("/images/avatar.png");
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (userDetails) {
      console.log(userDetails.fullName);
      setImage(userDetails.imageUrl);
      setUser({
        displayName: userDetails.fullName || 'Default Name',
        photoURL: userDetails.imageUrl || '/images/avatar.png',
        email: userDetails.emailAddresses.map(addr => addr.emailAddress).join(', ')
      });
    }
  }, [userDetails]);
  const handleSign = (user: any) => {
    setUser(user);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <React.Fragment>
        <Box
          sx={{ display: "flex", alignItems: "center", textAlign: "center" }}
        >
          <Tooltip title="Account settings">
            <CardMedia
              sx={{
                height: 55,
                width: 55,
                borderRadius: "50%",
                marginTop: "6px",
                marginRight: "6px"
              }}
              onClick={handleClick}
              image={image}
            />
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: "transparent",
              color: "white",
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0
              }
            }
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <AccountPage
            name={user?.displayName}
            image={user?.photoURL}
            email={user?.email}
          />
        </Menu>
      </React.Fragment>
    </ThemeProvider>
  );
}
