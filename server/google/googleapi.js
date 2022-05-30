const fs = require('fs');
const { google } = require('googleapis');

// folder id
// const pengirim_folder_id = process.env.PENGIRIM_FOLDER_ID;




module.exports = {
  uploadFile : async function uploadFile(fileName, filePath,folderId, message) {
    try {
      const auth = await new google.auth.GoogleAuth({
        keyFile: './server/googlekey.json',
        scopes: ['https://www.googleapis.com/auth/drive']
      })
      const drive = google.drive({ version: 'v3', auth });
      const fileMetadata = {
        name: fileName , 
        parents: [folderId]
      };
      const media = {
        mimeType: 'image/jpeg', 
        body: fs.createReadStream(filePath) // file path
      };
      
      // check if file exist
      const file = await drive.files.list({
        q: `name = '${fileName}' and '${folderId}' in parents`
      });

      let response
      if (file.data.files.length > 0) {
        // delete file
        await drive.files.delete({
          fileId: file.data.files[0].id
        })

        // upload file
        response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id'
        })
      } else {
        // upload file
        response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id'
        })
      }

      
      // console.log(filePath)
      // console.log('ini berjalan '+fileName)
      console.log(message)
      return response.data.id;
    } catch (error) {
      console.log(error)
      console.log('ini error')
      return error;
    }
  }
}
