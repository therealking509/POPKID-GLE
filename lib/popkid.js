// lib/popkid.js
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomBytes } from 'crypto';

export async function toAudio(buffer, ext = 'mp4') {
  const inputPath = join(tmpdir(), `${randomBytes(6).toString('hex')}.${ext}`);
  const outputPath = inputPath.replace(`.${ext}`, '.mp3');

  await writeFile(inputPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', async () => {
        const output = await readFile(outputPath);
        await unlink(inputPath);
        await unlink(outputPath);
        resolve(output);
      })
      .on('error', reject)
      .save(outputPath);
  });
}
