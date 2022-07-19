//create express router
const express = require('express');
const router = express.Router();

const { pengirimModel, kurirModel, loginUserModel } = require('../models/users_model');

let googlenya = require('../google/googleapi.js');
const pengirim_folder_id = process.env.PENGIRIM_FOLDER_ID;
const kurir_folder_id = process.env.KURIR_FOLDER_ID;
const ktp_kurir_folder_id = process.env.KTP_KURIR_FOLDER_ID;
const ktp_holding_kurir_folder_id = process.env.KTP_HOLDING_KURIR_FOLDER_ID;
const kenderaan_kurir_folder_id = process.env.KENDERAAN_KURIR_FOLDER_ID;

const io = require("socket.io-client");
const socket = io("http://localhost:3001/");

// crate get
router.get('/', async (req, res) => {
    console.log("ada request login");
    // console the parameter from the url
    // console.log(req.query);


    try {
        let username = req.query.username;
        let password = req.query.password;
        let role = req.query.role;
        // if username, password and role is empty or null
        if (!username || !password || !role) {
            res.status(400).send({
                status: false,
                message: 'username, password and role is required'
            });
            return;
        }

        // if role is not equal to 'pengirim' or 'kurir'
        if (role !== 'pengirim' && role !== 'kurir') {
            res.status(400).send({
                status: false,
                message: 'Role is wrong'
            });
            return;
        }

        // check from loginUserModel
        let user = await loginUserModel.findOne({
            username: username,
            password: password,
            role: role
        });

        // if user is not found
        if (!user) {
            res.status(400).send({
                status: false,
                message: 'Username dan Password Salah',
                focus: 'username'
            });
            return;
        }

        // console.log(user);

        res.status(200).send({
            status: true,
            message: 'Login Success',
            data: user
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, message: error.message });
    }

    // console.log(await googlenya.uploadFile('hehehehhe'))
    // res.send({ status: true, message: 'sini diaadasd' });
})




router.post('/daftar1', async (req, res) => {
    try {
        console.log("ada org request")
        let responenya;
        let data = req.body.data;
        // check if data is exist
        if (!data) {
            res.status(400).send({ status: false, message: 'data tidak boleh kosong' });
            return;
        }
        data = JSON.parse(data);
        console.log(data.role);

        if (data.role == 'kurir') {
            // console.log("sini rolenya");
            // return res.send({ status: true, message: 'berhasil daftar' });
            let isExist = await kurirModel.findOne({ nik: data.nik });
            console.log(isExist + "ini adalag evaluasi");
            // console.log("ini untuk nik")
            if (isExist) {
                let message;

                if (isExist.status == 'Evaluasi') {
                    message = 'NIK telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\nTim kami akan mengirim ke email yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran';
                } else if (isExist.status == 'Ditolak') {
                    message = 'NIK ini telah ditolak.\nSilahkan coba NIK lain';
                } else if (isExist.status == 'Aktif') {
                    message = 'NIK sudah terdaftar sebelumnya';
                }
                // let message = (isExist.status == 'Evaluasi') ? 'NIK telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\nTim kami akan mengirim ke email yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'NIK Sudah Terdaftar dan sudah diaktifkan';

                return res.status(400).send({
                    status: false,
                    message: message,
                    focus: 'nik'
                });

            }

            // check if data.no_telp is exists
            let isExist2 = await kurirModel.findOne({ no_telp: data.no_telp });
            // console.log(isExist2)
            // console.log("ini untuk no telpon")
            if (isExist2) {
                let message;

                if (isExist2.status == 'Evaluasi') {
                    message = 'No Telpon telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami'
                } else if (isExist2.status == 'Ditolak') {
                    message = 'No Telpon ini telah ditolak'
                } else if (isExist2.status == 'Aktif') {
                    message = 'No Telpon sudah terdaftar sebelumnya'
                }

                // let message = (isExist2.status == 'Evaluasi') ? 'No Telpon ini telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\n Jika anda pemilik no telpon ini, Tim kami akan mengirim ke email yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'No Telpon Sudah Terdaftar dan sudah diaktifkan';
                res.status(400).send({
                    status: false,
                    message: message,
                    focus: 'no_telp'
                });
                return;
            }

            // check if data.email is exists
            let isExist3 = await kurirModel.findOne({ email: data.email });
            // console.log(isExist3)
            // console.log("ini untuk email")
            if (isExist3) {
                let message;

                if (isExist3.status == 'Evaluasi') {
                    message = 'Email telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami'
                } else if (isExist3.status == 'Ditolak') {
                    message = 'Email ini telah ditolak'
                } else {
                    message = 'Email sudah terdaftar sebelumnya'
                }

                // let message = (isExist3.status == 'Evaluasi') ? 'Email ini telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\nTim kami akan mengirim ke email ini yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'Email Sudah Terdaftar dan sudah diaktifkan';
                res.status(400).send({
                    status: false,
                    message: message,
                    focus: 'email'
                });
                return;
            }


            // check if req.files.photo and req.files.ktp_photo and req.files.ktp_holding_photo and req.files.kenderaan_photo exist
            if (!req.files.photo || !req.files.ktp_photo || !req.files.ktp_holding_photo || !req.files.kenderaan_photo) {
                res.status(400).send({
                    status: false,
                    message: 'File tidak boleh kosong'
                });
                return;
            }


            res.send({ status: true, message: 'Anda akan mendapat notifikasi di email anda dan juga no telpon jika admin menyetujui ataupun membatalkan pendaftaran anda' });
            // console.log(data)
            let new_kurir = new kurirModel(data);

            let new_login = new loginUserModel(data);
            new_login._idnya = new_kurir._id;
            await new_kurir.save();
            await new_login.save();
            // console.log(new_kurir)
            // console.log(new_login)


            // add photo_url to new_kurir            
            let id_photo = googlenya.uploadFile(new_kurir._id + ".jpg", req.files.photo.path, kurir_folder_id, "ini photo kurir");



            // add ktp_url to new_kurir
            let id_ktp = googlenya.uploadFile("ktp_" + new_kurir._id + ".jpg", req.files.ktp_photo.path, ktp_kurir_folder_id, "ini ktp kurir");


            // add ktp_holding_url to new_kurir
            let id_ktp_holding = googlenya.uploadFile("ktp_holding_" + new_kurir._id + ".jpg", req.files.ktp_holding_photo.path, ktp_holding_kurir_folder_id, "ini ktp holding kurir");


            // add kenderaan_url to kurir
            let id_kenderaan = googlenya.uploadFile("kenderaan_" + new_kurir._id + ".jpg", req.files.kenderaan_photo.path, kenderaan_kurir_folder_id, "ini kenderaan kurir");

            const photo_url = `https://drive.google.com/uc?export=view&id=${await id_photo}`
            const ktp_url = `https://drive.google.com/uc?export=view&id=${await id_ktp}`
            const ktp_holding_url = `https://drive.google.com/uc?export=view&id=${await id_ktp_holding}`
            const kenderaan_url = `https://drive.google.com/uc?export=view&id=${await id_kenderaan}`


            // await kurirModel.findOneAndUpdate({ _id: new_kurir._id }, {
            //     status: 'Aktif',
            //     photo_url: photo_url,
            // })

            await kurirModel.findOneAndUpdate({ _id: new_kurir._id }, { photo_url: photo_url, ktp_url: ktp_url, ktp_holding_url: ktp_holding_url, kenderaan_url: kenderaan_url });

            socket.emit('tambah_verifikasi_kurir')

            // const data = await kurirModel.findOne({ _id: new_kurir._id });

            // console.log(data)


            // let new_login = new loginUserModel(data);

            // // push new_kurir._id to new_login._idnya
            // new_login._idnya = new_kurir._id;
            // console.log(new_login);

            // await new_kurir.save();
            // await new_login.save();



            // responsenya = new_kurir;
        } else if (data.role == 'pengirim') {
            let isExist = await pengirimModel.findOne({ no_telp: data.no_telp });
            if (isExist) {
                let message = (isExist.status == 'Evaluasi') ? 'No Telpon ini telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\n Jika anda pemilik no telpon ini, Tim kami akan mengirim ke email yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'No Telpon Sudah Terdaftar dan sudah diaktifkan';
                res.status(400).send({
                    status: false,
                    message: message,
                    focus: 'no_telp'
                });
                return;
            }

            let isExist2 = await pengirimModel.findOne({ email: data.email });
            // console.log(isExist2)
            // console.log("ini untuk email")
            if (isExist2) {
                let message = (isExist2.status == 'Evaluasi') ? 'Email ini telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\nTim kami akan mengirim ke email ini yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'Email Sudah Terdaftar dan sudah diaktifkan';
                res.status(400).send({
                    status: false,
                    message: message,
                    focus: 'email'
                });
                return;
            }

            // check if req.files.photo exist
            if (!req.files.photo) {
                res.status(400).send({
                    status: false,
                    message: 'File tidak boleh kosong'
                });
                return;
            }

            // console.log(req.files.photo);

            res.status(200).send({ status: true, message: 'Anda akan mendapat notifikasi di email anda dan juga no telpon jika admin menyetujui ataupun membatalkan pendaftaran anda' });

            let new_pengirim = new pengirimModel(data);
            console.log(new_pengirim)
            // add photo_url to new_pengirim
            let id_photo = googlenya.uploadFile(new_pengirim._id + ".jpg", req.files.photo.path, pengirim_folder_id, "ini photo pengirim");
            console.log(id_photo, " ini id photo")

            new_pengirim.photo_url = `https://drive.google.com/uc?export=view&id=${await id_photo}`

            // console.log(new_pengirim)

            let new_login = new loginUserModel(data);

            // push new_pengirim._id to new_login._idnya
            new_login._idnya = new_pengirim._id;
            // console.log(new_login);

            await new_pengirim.save();
            await new_login.save();
            socket.emit('tambah_verifikasi_pengirim')


        }


    }
    catch (error) {
        res.status(500).send({ status: false, data: error });
    }
})

module.exports = router;