const KEY_PREFIX = "verbario_expert_unlocked_";

export function isExpertUnlocked(gameId) {
  try {
    return localStorage.getItem(KEY_PREFIX + gameId) === "1";
  } catch {
    return false;
  }
}

export function unlockExpert(gameId) {
  try {
    localStorage.setItem(KEY_PREFIX + gameId, "1");
  } catch {
    // ignore
  }
}
