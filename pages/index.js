
import { useRef, useState } from 'react';
import { useRouter } from "next/router";
import MyAppBar from "../component/appBar";

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { ToastContainer, toast, Zoom, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

// require("dotenv").config();

function HomePage() {
  const [backdrop, setBackdrop] = useState(false);

  const usernameInputRef = useRef();
  const passwordInputRef = useRef();
  const router = useRouter();

  async function submitHandler(event) {
    event.preventDefault();
    setBackdrop(true);
    try {
      const username = usernameInputRef.current.value;
      const password = passwordInputRef.current.value;

      let http_server =  "/api/login_admin?username=" + username + "&password="
      // console.log(http_server);
      const response = await fetch(http_server, {
        // timeout: 10000,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'allow-cors-origin': '*',
          'crossDomain': true,
        }
      });

      const data = await response.json();

      if (response.status === 200) {
        setBackdrop(false);
        MySwal.fire({
          title: 'Login Success',
          text: 'You will be redirected to the admin page',
          icon: 'success',
          confirmButtonButton: false,
          timer: 2000
        })
        await router.push('/admin');
      }else{
        setBackdrop(false);
        MySwal.fire({
          title: 'Login Failed',
          text: 'Please check your username and password',
          icon: 'error',
          confirmButtonButton: false,
          timer: 2000
        })
      }

      // setBackdrop(true);

      // // await 4 sec
      // await new Promise(resolve => setTimeout(resolve, 4000));
      // toast.error("heheheh");
      // setBackdrop(false);

    } catch (error) {
      console.log("error", error);
    } finally {
      setBackdrop(false);
    }
    // setBackdrop(true);
  }

  return (
    <div>
      <ToastContainer position={toast.POSITION.TOP_CENTER} transition={Zoom} autoClose={2000} Bounce={Bounce} theme="colored" />
      <Backdrop open={backdrop} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}><CircularProgress color="inherit" /></Backdrop>
      <MyAppBar />
      {/* <Box style={{width: "100%",  minHeight: "93.4vh", padding: 80 , background: 'linear-gradient(to left bottom, #430089, #82ffa1)'}} > */}
      <Box sx={{ p: 3 }} style={{ width: "100%", minHeight: "93.4vh", background: 'linear-gradient(to left bottom, #430089, #82ffa1)' }}>
        <Grid
          container
          spacing={3}
          style={{ width: "100%", minHeight: "88vh", paddingLeft: "10%", paddingRight: "10%" }}
          justifyContent="center"
          alignItems="center"
        >
          <Grid item sm={2} />


          <Grid item sm={8} xs={12}>
            <Card component="form" align="center" sx={{ margin: "auto", maxWidth: "100%", minHeight: 310, paddingTop: 1, boxShadow: 10 }} onSubmit={submitHandler}>
              <h2>Admin Login</h2>
              <TextField
                inputRef={usernameInputRef}
                id="usernameTextField"
                label="Username"
                placeholder="Masukkan Username"
                sx={{ width: "85%", boxShadow: 10 }}
                required
              />
              <br /><br />
              <TextField
                inputRef={passwordInputRef}
                id="passwordTextField"
                type="password"
                label="Password"
                placeholder="Masukkan Password"
                sx={{ width: "85%", boxShadow: 10 }}
                required
              />
              <br /> <br />
              <Box textAlign="center">
                <Button variant="contained" type="submit"
                >Login</Button>
              </Box>
            </Card>
          </Grid>
          <Grid item sm={2} />

        </Grid>
      </Box>

      {/* </Box> */}

    </div>
  );
}

export default HomePage;