const SESSION_KEY = "tariffpilot_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "anonymous";

  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
