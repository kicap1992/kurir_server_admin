// create a react app
import { withIronSessionSsr } from "iron-session/next";
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';


import AdminAppBar from '../../component/admin/theComponent/appBar';
import AdminDrawer from '../../component/admin/theComponent/drawer';
import AdminDrawerHeader from "../../component/admin/theComponent/drawerHeadaer";
import AdminMain from '../../component/admin/theComponent/main';
import AdminDialog from '../../component/admin/theComponent/adminDialog';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';



const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#046767",
    color: "white",
  },

}));


import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoNotDisturbOffIcon from '@mui/icons-material/DoNotDisturbOff';


// sweet alert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

import { ToastContainer, toast, Zoom, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const io = require('socket.io-client');
const socket = io("http://localhost:3001/");
// let socketId;
// socket.on('connect', function () {
//   const sessionID = socket.id;
//   console.log('connected disini');
//   console.log(sessionID);
//   socketId = sessionID;
// });


function AdminIndexPage(props) {
  const title = 'Home'
  let socketId;
  socket.on('connect', function () {
    const sessionID = socket.id;
    console.log('connected disini');
    console.log(sessionID);
    // socketId = sessionID;
    // push sessionID to socketId
    socketId = sessionID;
    // console.log(socketId);
  });


  // const disconnectSocket = () => {
  //   console.log("sini disconnected")
  //   // socket.emit('disconnect_it', socketId);
  //   // socket.disconnect();
  // };


  const [openDrawer, setOpenDrawer] = useState(false);
  const [loadingData, setLoadingData] = useState(0);
  const [data, setData] = useState([]);
  // const [dataPengirim, setDataPengirim] = useState([]);
  const [backdrop, setBackdrop] = useState(true);
  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  useEffect(() => {
    // fetch

    const fetchData = async () => {
      let http_server = "/api/admin/get_all_kurir_verifikasi"
      // console.log(http_server);
      const response = await fetch(http_server, {
        // timeout: 10000,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'allow-cors-origin': '*',
          'crossDomain': true,
          'Authorization': 'Bearer ' + props.accessToken
        }
      });

      const json = await response.json();
      // console.log(json);
      // console.log(response.status);
      if (response.status === 200) {
        setData(json.data);
        // setBackdrop(false);
        console.log(data);
        setLoadingData(1);
      }

    }



    fetchData().catch(error => {
      console.log(error);
      setLoadingData(2);
    }).finally(() => {
      setBackdrop(false);
    })



  }, []);

  socket.on('tambah_verifikasi_kurir', async function () {
    // const sessionID = socket.socket;
    // console.log('connected');
    // console.log(sessionID);
    // setLoadingData(0);
    try {
      let http_server = "http://localhost:3001/api/admin/get_all_kurir_verifikasi"
      const response = await fetch(http_server, {
        // timeout: 10000,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'allow-cors-origin': '*',
          'crossDomain': true,
          'Authorization': 'Bearer ' + props.accessToken
        }
      });

      const json = await response.json();
      console.log(json);
      // console.log(response.status);
      if (response.status === 200) {
        setData(json.data);
        // setBackdrop(false);
        // console.log(data);
        setLoadingData(1);
        toast.info('Ada kurir baru menunggu verifikasi', {
          toastId: 'tambah_verifikasi_kurir',
        })

      }
    } catch (error) {
      console.log(error);
      // setLoadingData(2);
    }

  });

  socket.on('tambah_verifikasi_pengirim', async function () {
    // const sessionID = socket.socket;
    // console.log('connected');
    // console.log(sessionID);
    // setLoadingData(0);
    toast.info('Ada pengirim baru terdaftar\nAnda bisa lihat di menu "List User"', {
      toastId: 'tambah_verifikasi_pengirim',
    })

  });


  const [openDialog, setOpenDialog] = useState(false);
  const [dataClicked, setDataClicked] = useState({});
  const [roleClicked, setRoleClicked] = useState('');

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };


  async function beforeTerimaKurir(id, status) {
    // setSweetAlertLoading(true);
    handleDialogClose();
    await MySwal.fire({
      title: 'Yakin ?',
      text: `Kurir ini akan ${(status == "terima") ? "terdaftar" : "dibatalkan pendaftaran"} dalam sistem`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (status == "terima") ? 'Ya, daftar!' : 'Ya, batalkan!'
    }).then(async (result) => {
      if (result.value) {
        setBackdrop(true);
        setLoadingData(0);
        try {
          let http_server = (status == "terima") ? "/api/admin/verifikasi_kurir" : "/api/admin/batalkan_kurir"
          // console.log(http_server);
          const response = await fetch(http_server, {
            // timeout: 10000,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'allow-cors-origin': '*',
              'crossDomain': true,
              'Authorization': 'Bearer ' + props.accessToken
            },
            body: JSON.stringify({
              id_kurir: id,
            })
          });

          const json = await response.json();

          if (response.status === 200) {
            setLoadingData(1);
            MySwal.fire({
              title: 'Berhasil!',
              text: (status == "terima") ? "Kurir berhasil terdaftar" : "Pendaftaran kurir dibatalkan",
              icon: 'success',
              showConfirmButton: false,
              timer: 1500
            })
            setData(json.data);
            // setBackdrop(false);
            // window.location.reload();
          }
        } catch (error) {
          console.log(error);
          errornya(error);
          setLoadingData(2);

        }


      } else {
        handleDialogOpen();
      }
    })
    setBackdrop(false);
  }



  function errornya() {
    MySwal.fire({
      title: 'Error Jaringan',
      text: `Terjadi kesalahan jaringan, coba lagi\nAtau coba refresh browser anda`,
      icon: 'error',
      showConfirmButton: false,
      timer: 3000
    })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminDialog
        open={openDialog}
        handleClose={handleDialogClose}
        datanya={dataClicked}
        role={roleClicked}
        terimaKurir={
          (val) => {
            // console.log(val)
            beforeTerimaKurir(val, "terima")
          }
        }

        batalKurir={
          (val) => {
            // console.log(val)
            beforeTerimaKurir(val, "terima")
          }
        }
        // disconnectSocket={disconnectSocket}
      />
      <ToastContainer position={toast.POSITION.TOP_CENTER} transition={Zoom} autoClose={2000} Bounce={Bounce} theme="colored" />
      <Backdrop open={backdrop} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}><CircularProgress color="inherit" /></Backdrop>
      <CssBaseline />
      <AdminAppBar open={openDrawer} onClick={handleDrawerOpen} />
      <AdminDrawer
        title={title}
        open={openDrawer}
        onClickClose={handleDrawerClose}
        disconnectSocket={
          () => {
            // console.log("sini disconnected")
            // disconnectSocket()
          }
        }
      />
      <AdminMain open={openDrawer} style={{ width: "100%", minHeight: "100vh", background: 'linear-gradient(to left bottom, #430089, #82ffa1)' }}>
        <AdminDrawerHeader />
        <Box style={{ padding: 30 }} />
        <Grid
          container
          spacing={3}
          style={{ width: "100%", paddingLeft: "10%", paddingRight: "10%" }}
          justifyContent="center"
        >
          <Grid item sm={12} xs={12}>

            <Card component="form" align="center" sx={{ margin: "auto", maxWidth: "100%", maxHeight: 680, paddingTop: 1, boxShadow: 10, paddingLeft: 2, paddingRight: 2, paddingBottom: 1 }} >
              <Typography
                variant="h6"
                style={{
                  fontWeight: "bold"
                }}
                align="left"
              >
                Verifikasi Kurir
              </Typography>
              <Box style={{ paddingBottom: 4 }} />
              {
                loadingData === 0 ?
                  (
                    <>
                      <Box style={{ padding: 20, width: "100%" }} align="center">
                        <CircularProgress align="center" />
                      </Box>
                    </>


                  ) :
                  loadingData === 1 ?
                    (
                      <>
                        {
                          data.length > 0 ? (
                            <>
                              <TableContainer
                                component={Paper}
                                style={{
                                  overflowX: "auto",
                                  overflowY: "auto",
                                  minWidth: "100%",
                                  maxHeight: 600,
                                }}
                              >
                                <Table
                                  sx={{

                                    boxShadow: 3,
                                    "& .MuiTableCell-root": {
                                      borderLeft: "1px solid rgba(224, 224, 224, 1)"
                                    }
                                  }}
                                  aria-label="simple table"
                                >
                                  <TableHead

                                  >
                                    <TableRow>
                                      <StyledTableCell>NIK</StyledTableCell>
                                      <StyledTableCell align="right">Nama</StyledTableCell>
                                      <StyledTableCell align="right">No Kenderaan</StyledTableCell>
                                      <StyledTableCell align="right">No Telpon</StyledTableCell>
                                      {/* <StyledTableCell align="right">Alamat</StyledTableCell>
                                <StyledTableCell align="right">Email</StyledTableCell> */}
                                      <StyledTableCell align="right">Aksi</StyledTableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {data.map((row) => (
                                      <TableRow
                                        key={row._id}

                                      >
                                        <TableCell component="th" scope="row">
                                          {row.nik}
                                        </TableCell>
                                        <TableCell align="right">{row.nama}</TableCell>
                                        <TableCell align="right">{row.no_kenderaan}</TableCell>
                                        <TableCell align="right">{row.no_telp}</TableCell>
                                        {/* <TableCell align="right">{row.alamat}</TableCell>
                                  <TableCell align="right">{row.email}</TableCell> */}
                                        <TableCell align="right">
                                          <IconButton
                                            color="primary"
                                            aria-label="Info"
                                            onClick={
                                              () => {
                                                handleDialogOpen();
                                                setDataClicked(row);
                                                setRoleClicked('kurir');
                                              }
                                            }
                                          >
                                            <InfoIcon />
                                          </IconButton>
                                          <IconButton
                                            color="secondary"
                                            aria-label="Terima Pendaftaran"
                                            onClick={
                                              () => {
                                                // handleDialogOpen();
                                                setDataClicked(row);
                                                setRoleClicked('kurir');
                                                beforeTerimaKurir(row._id, "terima");
                                              }
                                            }
                                          >
                                            <CheckCircleOutlineIcon />
                                          </IconButton>
                                          <IconButton
                                            color="secondary"
                                            aria-label="Batalkan Pendaftaran"
                                            onClick={
                                              () => {
                                                // handleDialogOpen();
                                                setDataClicked(row);
                                                setRoleClicked('kurir');
                                                beforeTerimaKurir(row._id, "batalkan");
                                              }
                                            }
                                          >
                                            <DoNotDisturbOffIcon />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              <Box style={{ padding: 10 }} />
                            </>

                          ) : (
                            <>
                              <Box
                                sx={{
                                  paddingTop: 2,
                                }}
                              />
                              <Typography
                                variant="h3"
                                style={{ fontWeight: "bold" }}
                                align="center"
                              >Tiada Data Verifikasi Kurir</Typography>
                              <Box
                                sx={{
                                  paddingTop: 2,
                                }}
                              />
                            </>

                          )
                        }
                      </>

                    )
                    : (
                      <>
                        <Box
                          sx={{
                            paddingTop: 1,
                          }}
                        />
                        <Typography
                          variant="h3"
                          style={{ fontWeight: "bold" }}
                          align="center"
                        >Error Loading Data</Typography>
                        <Box
                          sx={{
                            paddingBottom: 1,
                          }}
                        />
                      </>
                    )
              }




            </Card>
          </Grid>
        </Grid>


      </AdminMain>
    </Box>
  );
}



export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {

    const data = req.session.data;
    // console.log(data)
    if (!data) {
      return {
        redirect: {
          destination: '/?error=true',
          permanent: false,
        }
      };
    }

    if (data.role != "admin") {
      try {
        console.log("jalankannya ini di admin")
        const url = process.env.HTTP_URL + "/api/login_admin/logout";
        await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'allow-cors-origin': '*',
            'crossDomain': true,
          },
        })

      } catch (err) {

      }

      return {
        redirect: {
          destination: '/?error=true',
          permanent: false,
        }
      };
    }


    return {
      props: {
        // user: req.session.user,
        accessToken: data.accessToken,
      },
    };
  },
  {
    cookieName: "myapp_cookiename",
    password: "complex_password_at_least_32_characters_long123456789",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  },
);




export default AdminIndexPage;