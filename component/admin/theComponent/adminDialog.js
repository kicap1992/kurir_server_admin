import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';


export default function AdminDialog(props) {
  // console.log(props.datanya);
  // console.log(props.role);

  return (
    <div>

      <Dialog
        open={props.open}
        fullWidth={true}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"

      >

        <DialogContent
          style={{
            background: 'linear-gradient(to left bottom, #430089, #82ffa1)',
            color: '#fff'
          }}
        >
          <Typography
            variant="h5"
            style={{
              fontWeight: 'bold',
            }}
            align="center"
          >
            Detail Kurir
          </Typography>
          <Box sx={{ p: 2 }}><Divider sx={{ bgcolor: "white" }} /> </Box>

          <FormGroup sx={{ paddingTop: 1 }}>
            <span>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                }}
              >
                NIK :
              </Typography>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                }}
              >
                &nbsp; {props.datanya.nik}
              </Typography>
            </span>
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <span>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                }}
              >
                Nama :
              </Typography>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                }}
              >
                &nbsp; {props.datanya.nama}
              </Typography>
            </span>
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <span>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                }}
              >
                No Kenderaan :
              </Typography>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                }}
              >
                &nbsp; {props.datanya.no_kenderaan}
              </Typography>
            </span>
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <span>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                }}
              >
                No Telepon :
              </Typography>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                }}
              >
                &nbsp; {props.datanya.no_telp}
              </Typography>
            </span>
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <span>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                }}
              >
                Alamat :
              </Typography>
              <Typography
                variant="h5"
                style={{
                  display: 'inline-block',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                }}
              >
                &nbsp; {props.datanya.alamat}
              </Typography>
            </span>
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <Typography
              variant="h5"
              style={{
                display: 'inline-block',
              }}
            >
              KTP :
            </Typography>
            <Card
              component="img"
              sx={{
                height: 450,
                width: "100%",
                // maxHeight: { xs: 233, md: 167 },
                // maxWidth: { xs: 350, md: 250 },
              }}
              alt="The house from the offer."
              src={props.datanya.ktp_url}
            />
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <Typography
              variant="h5"
              style={{
                display: 'inline-block',
              }}
            >
              Memegang KTP :
            </Typography>
            <Card
              component="img"
              sx={{
                height: 450,
                width: "100%",
                // maxHeight: { xs: 233, md: 167 },
                // maxWidth: { xs: 350, md: 250 },
              }}
              alt="The house from the offer."
              src={props.datanya.ktp_url}
            />
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <Typography
              variant="h5"
              style={{
                display: 'inline-block',
              }}
            >
              Foto:
            </Typography>
            <Card
              component="img"
              sx={{
                height: 450,
                width: "100%",
                // maxHeight: { xs: 233, md: 167 },
                // maxWidth: { xs: 350, md: 250 },
              }}
              alt="The house from the offer."
              src={props.datanya.photo_url}
            />
          </FormGroup>
          <FormGroup sx={{ paddingTop: 1 }}>
            <Typography
              variant="h5"
              style={{
                display: 'inline-block',
              }}
            >
              Kenderaan:
            </Typography>
            <Card
              component="img"
              sx={{
                height: 450,
                width: "100%",
                // maxHeight: { xs: 233, md: 167 },
                // maxWidth: { xs: 350, md: 250 },
              }}
              alt="The house from the offer."
              src={props.datanya.kenderaan_url}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions
          style={{
            background: '#C7D6EA ',
            color: '#fff'
          }}
        >
          <Button
            onClick={
              () => {
                props.terimaKurir(props.datanya._id)
              }
            }
            // style={{
            //   color: '#fff',
            
            // }}
            color="primary"
            variant="contained"
          >
            Terima<br/>Pendaftaran
          </Button>
          <Button
           onClick={
            () => {
              props.batalKurir(props.datanya._id)
            }
          }
            style={{
              color: '#fff',
            }}
            color="error"
            variant="contained"
          >
            Batalkan<br/>Pendaftaran
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}