/* Generates sky textures (clouds, sea) off the main thread. */
import { runTextureJob, type TextureJob } from './skyTextures';

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<{ id: number; job: TextureJob }>) => void) | null;
  postMessage: (message: unknown) => void;
};

scope.onmessage = async (e) => {
  const { id, job } = e.data;
  try {
    scope.postMessage({ id, blobs: await runTextureJob(job) });
  } catch (err) {
    scope.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
