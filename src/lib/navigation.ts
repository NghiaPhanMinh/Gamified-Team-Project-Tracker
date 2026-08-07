export type MainSection =
  | "home"
  | "projects"
  | "profile";

export type ProjectsView = "index" | "create" | "join" | "room" | "personal-tasks";

export const MAIN_NAV_ITEMS: { id: MainSection; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "projects", label: "Projects", icon: "▣" },
  { id: "profile", label: "Profile", icon: "☺" },
];
