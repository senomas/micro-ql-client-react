import React, { MouseEvent } from "react";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router";

const useStyles = makeStyles((theme: any) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  }
}));

export const NavMenu: React.FC = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const history = useHistory();
  const location = useLocation();
  const open = Boolean(anchorEl);

  const handleMenu = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const clickMenu = (path: string, event: MouseEvent) => {
    history.replace(path);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        edge="start"
        className={classes.menuButton}
        onClick={handleMenu}
        color="inherit"
        aria-label="menu"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem selected={location.pathname === '/about'} onClick={evt => clickMenu("/about", evt)}>About</MenuItem>
        <MenuItem selected={location.pathname === '/movie'} onClick={evt => clickMenu("/movie", evt)}>Movie</MenuItem>
      </Menu>
    </>
  );
};
