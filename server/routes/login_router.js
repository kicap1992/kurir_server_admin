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

// crate get
router.get('/', async (req, res) => {

    // console.log(await googlenya.uploadFile('hehehehhe'))
    res.send({ status: true, msg: 'sini dia' });
})

//create get for daftar
router.post('/daftar', async (req, res) => {


    try {
        // console.log(req)
        role = req.body.role;
        let responsenya;

        if (role == 'pengirim') {
            // console.log("ini untuk pengirim");
            // cek if req.body.no_telp is exist on database return true or false
            let isExist = await pengirimModel.findOne({ no_telp: req.body.no_telp });
            if (isExist) {
                res.status(400).send({ message: 'No Telpon Sudah Terdaftar' });
                return;
            }

            // check if req.body.email is exist on database return true or false
            let isExistEmail = await pengirimModel.findOne({ email: req.body.email });
            if (isExistEmail) {
                res.status(400).send({ message: 'Email Sudah Terdaftar' });
                return;
            }

            let new_pengirim = new pengirimModel(req.body);
            // add photo_url to pengirim
            // check if files.photo exist
            if (req.files.photo) {
                let id_photo = await googlenya.uploadFile(new_pengirim._id + ".jpg", req.files.photo.path, pengirim_folder_id, "ini photo pengirim");
                new_pengirim.photo_url = `https://drive.google.com/uc?export=view&id=${id_photo}`;
            }

            // console.log(new_pengirim);
            // console.log(pengirim_folder_id)

            await new_pengirim.save();
            responsenya = new_pengirim;
        } else if (role == 'kurir') {
            // check if req.body.nik is exists
            let isExist = await kurirModel.findOne({ nik: req.body.nik });
            if (isExist) {
                res.status(400).send({
                    status: false,
                    message: 'NIK Sudah Terdaftar'
                });
                return;
            }

            // check if req.body.no_telp is exists
            let isExist2 = await kurirModel.findOne({ no_telp: req.body.no_telp });
            if (isExist2) {
                res.status(400).send({
                    status: false,
                    message: 'No Telpon Sudah Terdaftar'
                });
                return;
            }

            // check if req.body.email is exists
            let isExist3 = await kurirModel.findOne({ email: req.body.email });
            if (isExist3) {
                res.status(400).send({
                    status: false,
                    message: 'Email Sudah Terdaftar'
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

            let new_kurir = new kurirModel(req.body);

            // add photo_url to new_kurir            
            let id_photo = googlenya.uploadFile(new_kurir._id + ".jpg", req.files.photo.path, kurir_folder_id, "ini photo kurir");



            // add ktp_url to new_kurir
            let id_ktp = googlenya.uploadFile("ktp_" + new_kurir._id + ".jpg", req.files.ktp_photo.path, ktp_kurir_folder_id, "ini ktp kurir");


            // add ktp_holding_url to new_kurir
            let id_ktp_holding = googlenya.uploadFile("ktp_holding_" + new_kurir._id + ".jpg", req.files.ktp_holding_photo.path, ktp_holding_kurir_folder_id, "ini ktp holding kurir");


            // add kenderaan_url to kurir
            let id_kenderaan = googlenya.uploadFile("kenderaan_" + new_kurir._id + ".jpg", req.files.kenderaan_photo.path, kenderaan_kurir_folder_id, "ini kenderaan kurir");

            new_kurir.photo_url = `https://drive.google.com/uc?export=view&id=${await id_photo}`
            new_kurir.ktp_url = `https://drive.google.com/uc?export=view&id=${await id_ktp}`
            new_kurir.ktp_holding_url = `https://drive.google.com/uc?export=view&id=${await id_ktp_holding}`
            new_kurir.kenderaan_url = `https://drive.google.com/uc?export=view&id=${await id_kenderaan}`

            console.log(new_kurir)
            await new_kurir.save();
            responsenya = new_kurir;
        }
        res.send({ status: true, data: responsenya });
    } catch (error) {
        res.status(500).send({ status: false, data: error });
    }

    // res.send('sini untuk daftar');
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

        if(data.role == 'kurir'){
            
            let isExist = await kurirModel.findOne({ nik: data.nik });
            // console.log(isExist.status + "ini adalag evaluasi");
            // console.log("ini untuk nik")
            if (isExist) {
                let message = (isExist.status == 'Evaluasi') ? 'NIK telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\nTim kami akan mengirim ke email yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'NIK Sudah Terdaftar dan sudah diaktifkan';

                res.status(400).send({
                    status: false,
                    message: message,
                    focus : 'nik'
                });
                return;
            }

            // check if data.no_telp is exists
            let isExist2 = await kurirModel.findOne({ no_telp: data.no_telp });
            console.log(isExist2)
            console.log("ini untuk no telpon")
            if (isExist2) {
                let message = (isExist2.status == 'Evaluasi') ? 'No Telpon ini telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\n Jika anda pemilik no telpon ini, Tim kami akan mengirim ke email yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'No Telpon Sudah Terdaftar dan sudah diaktifkan';
                res.status(400).send({
                    status: false,
                    message: message,
                    focus : 'no_telp'
                });
                return;
            }

            // check if data.email is exists
            let isExist3 = await kurirModel.findOne({ email: data.email });
            console.log(isExist3)
            console.log("ini untuk email")
            if (isExist3) {
                let message = (isExist3.status == 'Evaluasi') ? 'Email ini telah terdaftar sebelumnya dan sekarang dalam evaluasi tim kami.\nTim kami akan mengirim ke email ini yang anda daftarkan sebelumnya untuk konfirmasi pendaftaran' : 'Email Sudah Terdaftar dan sudah diaktifkan';
                res.status(400).send({
                    status: false,
                    message: message,
                    focus : 'email'
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

            let new_kurir = new kurirModel(data);
            // add photo_url to new_kurir            
            let id_photo = googlenya.uploadFile(new_kurir._id + ".jpg", req.files.photo.path, kurir_folder_id, "ini photo kurir");



            // add ktp_url to new_kurir
            let id_ktp = googlenya.uploadFile("ktp_" + new_kurir._id + ".jpg", req.files.ktp_photo.path, ktp_kurir_folder_id, "ini ktp kurir");


            // add ktp_holding_url to new_kurir
            let id_ktp_holding = googlenya.uploadFile("ktp_holding_" + new_kurir._id + ".jpg", req.files.ktp_holding_photo.path, ktp_holding_kurir_folder_id, "ini ktp holding kurir");


            // add kenderaan_url to kurir
            let id_kenderaan = googlenya.uploadFile("kenderaan_" + new_kurir._id + ".jpg", req.files.kenderaan_photo.path, kenderaan_kurir_folder_id, "ini kenderaan kurir");

            new_kurir.photo_url = `https://drive.google.com/uc?export=view&id=${await id_photo}`
            new_kurir.ktp_url = `https://drive.google.com/uc?export=view&id=${await id_ktp}`
            new_kurir.ktp_holding_url = `https://drive.google.com/uc?export=view&id=${await id_ktp_holding}`
            new_kurir.kenderaan_url = `https://drive.google.com/uc?export=view&id=${await id_kenderaan}`

            console.log(new_kurir)
            

            let new_login = new loginUserModel(data);

            // push new_kurir._id to new_login._idnya
            new_login._idnya = new_kurir._id;
            console.log(new_login);

            await new_kurir.save();
            await new_login.save();

            

            // responsenya = new_kurir;
        }


    }
    catch (error) {
        res.status(500).send({ status: false, data: error });
    }
})

module.exports = router;