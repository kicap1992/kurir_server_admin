
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

function AdminAppBar(props) {
  return (
    <AppBar position="fixed" open={props.open}>
      <Toolbar>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={props.onClick}
          edge="start"
          sx={{ mr: 2, ...(props.open && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 0.5 }} />
        <Avatar src="/logo.png" sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div">
          Enrekang Kurir
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default AdminAppBar;