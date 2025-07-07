import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

export const toAudio = (buffer, ext) => {
  return new Promise((resolve, reject) => {
    const tmpInput = path.join(tmpdir(), `input_${Date.now()}.${ext}`);
    const tmpOutput = path.join(tmpdir(), `output_${Date.now()}.mp3`);
    fs.writeFileSync(tmpInput, buffer);

    exec(`ffmpeg -i ${tmpInput} -vn -ab 128k -ar 44100 -y ${tmpOutput}`, (err) => {
      if (err) return reject(err);
      const result = fs.readFileSync(tmpOutput);
      fs.unlinkSync(tmpInput);
      fs.unlinkSync(tmpOutput);
      resolve(result);
    });
  });
};
