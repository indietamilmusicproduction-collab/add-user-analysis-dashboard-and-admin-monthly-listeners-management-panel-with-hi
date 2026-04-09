import {
  createActorWithConfig,
  useActor as useActorBase,
} from "@caffeineai/core-infrastructure";
import { createActor as createBackendActor } from "../backend";

// Wrap createActor to match the expected signature
function createActorFn(
  canisterId: string,
  uploadFile: (file: any) => Promise<Uint8Array>,
  downloadFile: (file: Uint8Array) => Promise<any>,
  options: any,
) {
  return createBackendActor(canisterId, uploadFile, downloadFile, options);
}

export function useActor() {
  return useActorBase(createActorFn as any);
}
