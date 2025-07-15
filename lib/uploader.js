import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

export const CatboxUrl = async (filePath) => {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
    });

    if (response.status === 200 && response.data.startsWith('https://')) {
      return response.data;
    } else {
      throw new Error('Invalid response from Catbox: ' + response.data);
    }

  } catch (err) {
    console.error('❌ Failed to upload to Catbox:', err);
    throw err;
  }
};
