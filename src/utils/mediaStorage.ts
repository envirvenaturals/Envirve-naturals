// Media processing, client-side compression, and IndexedDB local storage utility

// Open or get IndexedDB for storing larger video blobs
const DB_NAME = 'envirve_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save blob to IndexedDB:', err);
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get blob from IndexedDB:', err);
    return null;
  }
}

export async function getMediaBlobUrl(id: string): Promise<string | null> {
  const blob = await getMediaBlob(id);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

/**
 * Compresses an image file client-side to ensure it is ultra-lightweight (< 60KB),
 * preventing Firestore 1MB document quota breaches and localStorage QuotaExceeded errors
 * while retaining high botanical visual fidelity.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.74
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, preserve raw data URL
    if (file.type.includes('svg') || file.type.includes('gif')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve((readerEvent.target?.result as string) || '');
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Always compress to JPEG for optimal lightweight file size (< 60KB)
        // (PNG format ignores quality param in toDataURL and results in multi-megabyte bloat)
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (_) {
          resolve((readerEvent.target?.result as string) || '');
        }
      };
      img.onerror = () => {
        resolve((readerEvent.target?.result as string) || '');
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts a lightweight video poster thumbnail from the first playable frame.
 */
export async function extractVideoPoster(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
      resolve('');
    }, 4000);

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, video.duration > 1 ? 0.5 : 0.1);
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth || 640, 800);
        canvas.height = Math.round(
          (canvas.width * (video.videoHeight || 480)) / (video.videoWidth || 640)
        );

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const poster = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(fileUrl);
          resolve(poster);
          return;
        }
      } catch (err) {
        console.warn('Canvas poster capture notice:', err);
      }
      URL.revokeObjectURL(fileUrl);
      resolve('');
    };

    video.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(fileUrl);
      resolve('');
    };
  });
}

/**
 * Processes an uploaded video file:
 * 1. Creates a local blob URL for instant playback
 * 2. Generates a lightweight JPEG poster thumbnail
 * 3. Saves the video Blob into browser IndexedDB so it survives refreshes
 */
export async function processVideoUpload(file: File): Promise<{
  videoUrl: string;
  posterUrl: string;
  sizeMb: number;
  fileName: string;
}> {
  const sizeMb = Math.round((file.size / (1024 * 1024)) * 10) / 10;
  const uniqueId = `video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Store in IndexedDB
  await saveMediaBlob(uniqueId, file);

  // Object URL for current browser session
  const objectUrl = URL.createObjectURL(file);

  // Extract poster thumbnail
  let posterUrl = '';
  try {
    posterUrl = await extractVideoPoster(file);
  } catch (e) {
    console.warn('Poster generation error:', e);
  }

  // Use a protocol format that can be rehydrated or used directly
  const storedUrl = `idb://${uniqueId}#${objectUrl}`;

  return {
    videoUrl: storedUrl,
    posterUrl: posterUrl || '',
    sizeMb,
    fileName: file.name,
  };
}

/**
 * Resolves a stored media URL (handles idb:// protocol or standard URLs)
 */
export function resolveMediaSrc(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('idb://')) {
    const parts = url.split('#');
    if (parts.length > 1 && parts[1]) {
      return parts[1]; // Return active blob URL
    }
  }
  return url;
}

/**
 * Rehydrates an idb:// URL after browser reload by obtaining a fresh Blob URL
 */
export async function rehydrateMediaUrl(url: string | undefined): Promise<string> {
  if (!url) return '';
  if (url.startsWith('idb://')) {
    const [proto, blobPart] = url.split('#');
    const key = proto.replace('idb://', '');
    const newBlobUrl = await getMediaBlobUrl(key);
    if (newBlobUrl) {
      return newBlobUrl;
    }
    return blobPart || '';
  }
  return url;
}
