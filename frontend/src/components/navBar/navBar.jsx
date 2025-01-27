import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPermissao = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3001/role", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setRole(response.data.role);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setRole(null);
      }
    };
    verificarPermissao();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const adminLinks = [
    { text: "Adicionar Livros", to: "/admin" },
    { text: "Remover Livros", to: "/admin2" },
    { text: "Registrar Devolução", to: "/devolucao" },
    { text: "Catálogo", to: "/catalogo" },
  ];

  const userLinks = [{ text: "Catálogo", to: "/catalogo" }];

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            <img
              src="/logo.png"
              alt="Biblioteca 021"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/catalogo")}
            />
          </Typography>

          <IconButton
            color="inherit"
            onClick={(event) => handleProfileClick(event)}
          >
            <AccountCircleIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => { navigate("/usuario");}}
            >
              Histórico de Empréstimos
            </MenuItem>
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
            Menu
          </Typography>
          <Divider />
          <List>
            {links.map((link) => (
              <ListItem button key={link.text} component={Link} to={link.to}>
                <ListItemText primary={link.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default NavBar;
