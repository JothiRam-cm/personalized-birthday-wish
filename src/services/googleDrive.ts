import {
  BirthdayConfig,
  DrivePhotoItem,
  DriveWishSummary,
} from '../types/birthday';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const FOLDER_NAME = 'Birthday Wishes';

async function driveFetch(
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Google Drive error (${res.status}): ${errText}`);
  }
  return res;
}

export async function getOrCreateWishFolder(
  accessToken: string
): Promise<string> {
  const q = encodeURIComponent(
    `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await driveFetch(
    `${DRIVE_FILES_URL}?q=${q}&fields=files(id,name)&pageSize=5`,
    accessToken
  );
  const searchData = (await searchRes.json()) as {
    files?: Array<{ id: string; name: string }>;
  };

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  const createRes = await driveFetch(DRIVE_FILES_URL, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const created = (await createRes.json()) as { id: string };
  return created.id;
}

export async function listSavedWishes(
  accessToken: string
): Promise<DriveWishSummary[]> {
  const q = encodeURIComponent(
    `appProperties has { key='birthdayWishApp' and value='true' } and trashed = false`
  );
  const res = await driveFetch(
    `${DRIVE_FILES_URL}?q=${q}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,appProperties)&pageSize=25`,
    accessToken
  );
  const data = (await res.json()) as {
    files?: Array<{
      id: string;
      name: string;
      modifiedTime: string;
      appProperties?: Record<string, string>;
    }>;
  };

  return (data.files || []).map((file) => ({
    fileId: file.id,
    name: file.name.replace(/\.json$/i, ''),
    modifiedTime: file.modifiedTime,
    recipientName: file.appProperties?.recipientName,
  }));
}

export async function saveWishToDrive(
  accessToken: string,
  config: BirthdayConfig,
  existingFileId?: string
): Promise<DriveWishSummary> {
  const folderId = await getOrCreateWishFolder(accessToken);
  const cleanRecipient = (config.recipientName || 'Special Someone').trim();
  const fileName = `Birthday Wish for ${cleanRecipient}.json`;

  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'application/json',
    appProperties: {
      birthdayWishApp: 'true',
      recipientName: cleanRecipient.slice(0, 60),
    },
  };

  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------birthday_wish_boundary_314159';
  const payload = JSON.stringify(config, null, 2);

  const multipartBody = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    payload,
    `--${boundary}--`,
  ].join('\r\n');

  const url = existingFileId
    ? `${DRIVE_UPLOAD_URL}/${existingFileId}?uploadType=multipart&fields=id,name,modifiedTime,appProperties`
    : `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,modifiedTime,appProperties`;

  const res = await driveFetch(url, accessToken, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  const saved = (await res.json()) as {
    id: string;
    name: string;
    modifiedTime: string;
    appProperties?: Record<string, string>;
  };

  return {
    fileId: saved.id,
    name: saved.name.replace(/\.json$/i, ''),
    modifiedTime: saved.modifiedTime,
    recipientName: saved.appProperties?.recipientName || cleanRecipient,
  };
}

export async function loadWishFromDrive(
  accessToken: string,
  fileId: string
): Promise<BirthdayConfig> {
  const res = await driveFetch(
    `${DRIVE_FILES_URL}/${fileId}?alt=media`,
    accessToken
  );
  const parsed = (await res.json()) as BirthdayConfig;
  return {
    ...parsed,
    id: fileId,
  };
}

export async function deleteWishFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  await driveFetch(`${DRIVE_FILES_URL}/${fileId}`, accessToken, {
    method: 'DELETE',
  });
}

export async function listDriveImages(
  accessToken: string
): Promise<DrivePhotoItem[]> {
  const q = encodeURIComponent(
    `mimeType contains 'image/' and trashed = false`
  );
  const res = await driveFetch(
    `${DRIVE_FILES_URL}?q=${q}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,thumbnailLink,modifiedTime)&pageSize=24`,
    accessToken
  );
  const data = (await res.json()) as {
    files?: Array<{
      id: string;
      name: string;
      mimeType: string;
      thumbnailLink?: string;
      modifiedTime?: string;
    }>;
  };
  return (data.files || []).map((f) => ({
    fileId: f.id,
    name: f.name,
    mimeType: f.mimeType,
    thumbnailLink: f.thumbnailLink,
    modifiedTime: f.modifiedTime,
  }));
}

export async function compressImageBlobToDataUrl(
  blob: Blob,
  maxEdge = 880,
  quality = 0.82
): Promise<string> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode image'));
      el.src = objectUrl;
    });

    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadDriveImageAsDataUrl(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await driveFetch(
    `${DRIVE_FILES_URL}/${fileId}?alt=media`,
    accessToken
  );
  const blob = await res.blob();
  return compressImageBlobToDataUrl(blob);
}

export async function uploadPhotoToDrive(
  accessToken: string,
  title: string,
  dataUrl: string
): Promise<string> {
  const folderId = await getOrCreateWishFolder(accessToken);
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  const metadata = {
    name: `${title.replace(/[^\w\s.-]/g, '_') || 'keepsake'}.jpg`,
    mimeType: blob.type || 'image/jpeg',
    parents: [folderId],
    appProperties: {
      birthdayWishKeepsake: 'true',
    },
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const uploadRes = await driveFetch(
    `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id`,
    accessToken,
    {
      method: 'POST',
      body: form,
    }
  );
  const created = (await uploadRes.json()) as { id: string };
  return created.id;
}
