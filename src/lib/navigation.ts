export type MainSection =
  | "home"
  | "projects"
  | "profile";

export type ProjectsView = "index" | "create" | "join" | "room" | "personal-tasks";

export const MAIN_NAV_ITEMS: { id: MainSection; label: string; path: string }[] = [
  { id: "home", label: "Home", path: "/" },
  { id: "projects", label: "Projects", path: "/projects" },
  { id: "profile", label: "Profile", path: "/profile" },
];

export function getPathForSection(section: MainSection, view?: ProjectsView, roomId?: string): string {
  if (section === "home") return "/";
  if (section === "profile") return "/profile";
  if (section === "projects") {
    if (view === "create") return "/projects/create";
    if (view === "join") return "/projects/join";
    if (view === "personal-tasks") return "/projects/my-tasks";
    if (view === "room" && roomId) return `/rooms/${roomId}`;
    return "/projects";
  }
  return "/";
}
