"use client"
import * as React from "react";
import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AccountPage from "./account-page";
import { useState, useEffect } from "react";

import { useUser } from "@clerk/nextjs";

export const useUserDetails = () => {
  const { user: userDetails } = useUser();
  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<string>("/images/avatar.png");

  useEffect(() => {
    if (userDetails) {
      setImage(userDetails.imageUrl);
      setUser({
        displayName: userDetails.fullName || 'Default Name',
        photoURL: userDetails.imageUrl || '/images/avatar.png',
        email: userDetails.emailAddresses.map(addr => addr.emailAddress).join(', ')
      });
    }
  }, [userDetails]);

  return { user, image };
};


const darkTheme = createTheme({
  palette: {
    mode: "dark"
  }
});

const AccountMenu: React.FC = () => {
  const { user, image } = useUserDetails(); // Use the custom hook
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
};

export default AccountMenu;
