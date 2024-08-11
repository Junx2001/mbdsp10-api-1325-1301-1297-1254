
const User = require('../models/user');// reference to our user model

const fb_service = require('./firebase/firebase-service');// reference to our db 


const uploadUserImage = async (req, res, user) => {
    const file = req.file;     
		// Create the file metadata
		/** @type {any} */
		const metadata = {
			contentType: file.mimetype
		};
		const storageRef = fb_service.fb_storage.ref(fb_service.storage, 'user_pictures/' + user._id + '.' + file.mimetype.split('/')[1]);
		const uploadTask = fb_service.fb_storage.uploadBytesResumable(storageRef, file.buffer, metadata);
		
		// Listen for state changes, errors, and completion of the upload.
		 uploadTask.on('state_changed',
			 (snapshot) => {
			// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			console.log('Upload is ' + progress + '% done');
			switch (snapshot.state) {
				case 'paused':
				console.log('Upload is paused');
				break;
				case 'running':
				console.log('Upload is running');
				break;
			}
			}, 
			 (error) => {
			console.log(error)
			}, 
			 () => {
			// Upload completed successfully, now we can get the download URL
			 fb_service.fb_storage.getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
				console.log('File available at', downloadURL);

                return await User.updateOne({ _id: user._id}, { picture: downloadURL});

				// res.status(200).send({
				// 	message: 'User Picture has been successfully uploaded',
				// 	url: downloadURL
				// });
                
			});
			}
		);
}

module.exports = {
    uploadUserImage
};