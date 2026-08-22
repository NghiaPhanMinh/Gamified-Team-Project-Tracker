import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMutation, useQuery } from "convex/react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FolderKanban, Home, ListChecks, Menu, UserRound } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BrandLogo } from "../brand/BrandLogo";
import { TeamSystem } from "../teams/TeamSystem";
import { ThemeToggle } from "../theme/ThemeToggle";
import { ProfileCenter } from "../profile/ProfileCenter";
import { MAIN_NAV_ITEMS, getPathForSection, type MainSection, type ProjectsView } from "../../lib/navigation";
import { getGroupColor } from "../../lib/groupColors";

import { ActivityCenter } from "../teams/ActivityCenter";



export function AuthenticatedHome() {
  const { signOut } = useAuthActions();
  const location = useLocation();
  const navigate = useNavigate();

  const profile = useQuery(api.profiles.getOrNull);
  const profileComplete =
    profile !== undefined &&
    profile !== null &&
    profile.profileCompletedAt !== undefined &&
    profile.weeklyCapacity !== undefined &&
    (profile.skills?.length ?? 0) + (profile.softwareSkills?.length ?? 0) > 0;

  const rooms = useQuery(api.teams.listMine, profileComplete ? {} : "skip");
  const ensureProfile = useMutation(api.profiles.ensureCurrent);
  const hasRequestedProfile = useRef(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (profile !== null || hasRequestedProfile.current) {
      return;
    }

    hasRequestedProfile.current = true;
    void ensureProfile().catch(() => {
      setProfileError(
        "Your MayLamDi profile could not be prepared. Please sign out and try again.",
      );
    });
  }, [ensureProfile, profile]);

  // Synchronize state from current URL location
  const path = location.pathname;
  let activeSection: MainSection = "home";
  let projectsView: ProjectsView = "index";
  let selectedRoomId: Id<"teams"> | null = null;

  if (path.startsWith("/profile")) {
    activeSection = "profile";
  } else if (path.startsWith("/projects/create")) {
    activeSection = "projects";
    projectsView = "create";
  } else if (path.startsWith("/projects/join")) {
    activeSection = "projects";
    projectsView = "join";
  } else if (path.startsWith("/projects/my-tasks")) {
    activeSection = "projects";
    projectsView = "personal-tasks";
  } else if (path.startsWith("/rooms/")) {
    activeSection = "projects";
    projectsView = "room";
    const roomIdStr = path.replace("/rooms/", "").split("/")[0];
    if (roomIdStr) {
      selectedRoomId = roomIdStr as Id<"teams">;
    }
  } else if (path.startsWith("/projects")) {
    activeSection = "projects";
    projectsView = "index";
  }

  if (profileError) {
    return (
      <main className="auth-state-page">
        <BrandLogo />
        <h1 className="display-heading">Profile setup needs attention.</h1>
        <p role="alert">{profileError}</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </main>
    );
  }

  if (profile === undefined || profile === null) {
    return (
      <main className="auth-state-page" aria-busy="true">
        <BrandLogo />
        <p className="kicker">Setting up your workspace</p>
        <h1 className="display-heading">Making room for your team.</h1>
        <p role="status">Preparing your MayLamDi profile…</p>
      </main>
    );
  }

  if (!profileComplete) {
    return (
      <main className="authenticated-shell profile-gate-shell">
        <header className="app-header">
          <Link className="nav-brand" to="/" aria-label="MayLamDi home"><BrandLogo compact /><span>MayLamDi</span></Link>
          <div className="nav-actions"><ThemeToggle /><button className="secondary-button" type="button" onClick={() => void signOut()}>Sign out</button></div>
        </header>
        <div className="profile-gate-content"><ProfileCenter setupRequired /></div>
      </main>
    );
  }

  const availableRooms = rooms ?? [];
  const activeRoomId = availableRooms.some((room) => room._id === selectedRoomId)
    ? selectedRoomId
    : (availableRooms[0]?._id ?? selectedRoomId);

  function openProjects(view: ProjectsView, roomId?: Id<"teams">) {
    const targetPath = getPathForSection("projects", view, roomId);
    navigate(targetPath);
    setMobileMenuOpen(false);
  }

  function handleNavClick(item: (typeof MAIN_NAV_ITEMS)[number]) {
    navigate(item.path);
    setMobileMenuOpen(false);
  }

  return (
    <main className={`authenticated-shell app-shell ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <header className="app-header">
        <button className="nav-menu-button" type="button" aria-label="Toggle sidebar" onClick={() => {
          if (window.matchMedia("(max-width: 760px)").matches) {
            setMobileMenuOpen((current) => !current);
          } else {
            setSidebarOpen((current) => !current);
          }
        }}>☰</button>
        <Link className="nav-brand" to="/" aria-label="MayLamDi home">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </Link>
        <div className="nav-actions">
          {activeRoomId ? <ActivityCenter teamId={activeRoomId} /> : null}
          <ThemeToggle />
          <button
            className="secondary-button"
            type="button"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </header>
      <aside className={`app-sidebar ${mobileMenuOpen ? "is-mobile-open" : ""}`} aria-label="Main navigation">
        <nav>
          {MAIN_NAV_ITEMS.map((item) => (
            <button key={item.id} className={activeSection === item.id ? "is-active" : ""} type="button" onClick={() => handleNavClick(item)}>
              <span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong>
            </button>
          ))}
          <div className="sidebar-room-tree" aria-label="Project rooms">
            {availableRooms.map((room, index) => (
              <button
                key={room._id}
                className={activeSection === "projects" && projectsView === "room" && activeRoomId === room._id ? "is-active is-room is-project-room" : "is-room is-project-room"}
                type="button"
                style={{ "--group-color": getGroupColor(index) } as CSSProperties}
                onClick={() => openProjects("room", room._id)}
              >
                <span className="project-color-marker" aria-hidden="true" /><strong>{room.name}</strong>
              </button>
            ))}
            <button className={projectsView === "personal-tasks" ? "is-active is-room" : "is-room"} type="button" onClick={() => openProjects("personal-tasks")}>
              <span aria-hidden="true">└</span><strong>My Tasks</strong>
            </button>
          </div>
        </nav>
      </aside>
      {mobileMenuOpen ? <button className="nav-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} /> : null}
      <div className="app-content">
        <div className="content-container">
          <TeamSystem
            profile={profile}
            activeSection={activeSection}
            projectsView={projectsView}
            rooms={availableRooms}
            selectedRoomId={activeRoomId}
            onNavigateHome={() => navigate("/home")}
            onOpenProjects={(view) => openProjects(view)}
            onOpenRoom={(roomId) => openProjects("room", roomId)}
          />
        </div>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button className={activeSection === "home" ? "is-active" : ""} type="button" onClick={() => { navigate("/home"); setMobileMenuOpen(false); }}><Home aria-hidden="true" /><span>Home</span></button>
        <button className={activeSection === "projects" && projectsView !== "personal-tasks" ? "is-active" : ""} type="button" onClick={() => openProjects("index")}><FolderKanban aria-hidden="true" /><span>Projects</span></button>
        <button className={projectsView === "personal-tasks" ? "is-active" : ""} type="button" onClick={() => openProjects("personal-tasks")}><ListChecks aria-hidden="true" /><span>Tasks</span></button>
        <button className={activeSection === "profile" ? "is-active" : ""} type="button" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}><UserRound aria-hidden="true" /><span>Profile</span></button>
        <button className={mobileMenuOpen ? "is-active" : ""} type="button" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)}><Menu aria-hidden="true" /><span>More</span></button>
      </nav>
    </main>
  );
}
