import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AdminDrawerHeader from './drawerHeadaer';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import LogoutIcon from '@mui/icons-material/Logout';
import Typography from '@mui/material/Typography';
import Router from 'next/router';


const listmenu = [
  {
    name: "Home",
    name2: "Verifikasi Kurir",
    icon: <PlaylistAddIcon />,
    router: "/admin"
  },
  {
    name: "list_user",
    name2: "List User",
    icon: <PlaylistAddCheckIcon />,
    router: "/admin/list_user"
  },
  {
    name: "logout",
    name2: "Logout",
    icon: <LogoutIcon />,
    // router : "/admin/logout"
  },
]

const drawerWidth = 240;

function AdminDrawer(props) {
  const theme = useTheme();
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={props.open}
    >
      <AdminDrawerHeader>
        <Typography variant="h6" noWrap>Enrekang Kurir</Typography>
        <IconButton onClick={props.onClickClose} >
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </AdminDrawerHeader>
      <Divider />
      <List>
        {listmenu.map((menu, index) => (
          <ListItem key={menu.name} disablePadding>
            <ListItemButton
              sx={{
                backgroundColor: (props.title === menu.name) ? '#046767' : null,
                color: (props.title === menu.name) ? 'white' : "black",
                '&:hover': {
                  background: (props.title === menu.name) ? "#024848" : null, // ini
                },
                cursor: (props.title == menu.name) ? 'default' : "pointer",
              }}
              onClick={() => 
                {
                  if(menu.name != "logout" && menu.name != props.title){
                    props.disconnectSocket()
                    Router.push(menu.router)
                  }
                  
                }
              }
            >
              <ListItemIcon
                sx={{
                  color: (props.title === menu.name) ? 'white' : "black",
                }}
              >
                {menu.icon}
              </ListItemIcon>
              <ListItemText primary={menu.name2} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

    </Drawer>
  )
}

export default AdminDrawer