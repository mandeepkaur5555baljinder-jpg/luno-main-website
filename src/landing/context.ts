import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { Director, SceneState } from "./engine/director";

export const DirectorContext = createContext<Director | null>(null);

const IDLE: SceneState = { active: 0, mode: -1, stream: -1, ready: false, covered: false };
const noopSubscribe = () => () => {};
const idleSnapshot = () => IDLE;

export function useDirector() {
  return useContext(DirectorContext);
}

/** Active scene, highlighted mode / stream. Re-renders only when one of those changes. */
export function useSceneState(): SceneState {
  const dir = useDirector();
  const subscribe = useMemo(() => (dir ? dir.subscribe : noopSubscribe), [dir]);
  const snapshot = useMemo(() => (dir ? dir.getState : idleSnapshot), [dir]);
  return useSyncExternalStore(subscribe, snapshot, idleSnapshot);
}
