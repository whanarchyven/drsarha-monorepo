import { NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

const getExtension = (fileName: string, contentType: string) => {
  if (contentType.includes('mp4')) return '.mp4';
  const match = fileName.match(/\.[a-z0-9]+$/i);
  return match ? match[0] : '.bin';
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    const bucket = process.env.S3_BUCKET_NAME;
    if (!accessKey || !secretKey || !bucket) {
      return NextResponse.json(
        { error: 'S3 credentials not configured' },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';
    const ext = getExtension(file.name, contentType);
    const filename = `${crypto.randomUUID()}${ext}`;
    const prefix = (process.env.S3_IMAGE_DIRECTORY || '').replace(/\/$/, '');
    const key = prefix ? `${prefix}/video/${filename}` : `video/${filename}`;
    const relativePath = `video/${filename}`;

    const client = new S3Client({
      region: process.env.S3_REGION ?? process.env.AWS_REGION ?? 'us-east-1',
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      ...(process.env.S3_ENDPOINT_URL && {
        endpoint: process.env.S3_ENDPOINT_URL,
        forcePathStyle: true,
      }),
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return NextResponse.json({ path: relativePath });
  } catch (error) {
    console.error('Upload video error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки видео' },
      { status: 500 }
    );
  }
}
