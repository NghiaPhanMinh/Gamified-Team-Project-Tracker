import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BrandLogo } from "../brand/BrandLogo";
import { TeamSystem } from "../teams/TeamSystem";
import { ThemeToggle } from "../theme/ThemeToggle";
import { ProfileCenter } from "../profile/ProfileCenter";
import { MAIN_NAV_ITEMS, type MainSection, type ProjectsView } from "../../lib/navigation";

export function AuthenticatedHome() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.getOrNull);
  const rooms = useQuery(api.teams.listMine);
  const ensureProfile = useMutation(api.profiles.ensureCurrent);
  const hasRequestedProfile = useRef(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<MainSection>("home");
  const [projectsView, setProjectsView] = useState<ProjectsView>("index");
  const [selectedRoomId, setSelectedRoomId] = useState<Id<"teams"> | null>(null);
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

  const profileComplete =
    profile.profileCompletedAt !== undefined &&
    profile.weeklyCapacity !== undefined &&
    (profile.skills?.length ?? 0) + (profile.softwareSkills?.length ?? 0) > 0;

  if (!profileComplete) {
    return (
      <main className="authenticated-shell profile-gate-shell">
        <header className="app-header">
          <a className="nav-brand" href="/" aria-label="MayLamDi home"><BrandLogo compact /><span>MayLamDi</span></a>
          <div className="nav-actions"><ThemeToggle /><button className="secondary-button" type="button" onClick={() => void signOut()}>Sign out</button></div>
        </header>
        <div className="profile-gate-content"><ProfileCenter setupRequired /></div>
      </main>
    );
  }

  const availableRooms = rooms ?? [];
  const activeRoomId = availableRooms.some((room) => room._id === selectedRoomId)
    ? selectedRoomId
    : (availableRooms[0]?._id ?? null);

  function openProjects(view: ProjectsView, roomId?: Id<"teams">) {
    setActiveSection("projects");
    setProjectsView(view);
    if (roomId) setSelectedRoomId(roomId);
    setMobileMenuOpen(false);
  }

  return (
    <main className={`authenticated-shell app-shell ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <header className="app-header">
        <button className="nav-menu-button" type="button" aria-label="Toggle navigation" onClick={() => {
          setSidebarOpen((current) => !current);
          setMobileMenuOpen((current) => !current);
        }}>☰</button>
        <a className="nav-brand" href="/" aria-label="MayLamDi home">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </a>
        <div className="nav-actions">
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
            <button key={item.id} className={activeSection === item.id ? "is-active" : ""} type="button" onClick={() => {
              setActiveSection(item.id);
              if (item.id === "projects") setProjectsView("index");
              setMobileMenuOpen(false);
            }}>
              <span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong>
            </button>
          ))}
          <div className="sidebar-room-tree" aria-label="Project rooms">
            {availableRooms.map((room) => (
              <button
                key={room._id}
                className={activeSection === "projects" && projectsView === "room" && activeRoomId === room._id ? "is-active is-room" : "is-room"}
                type="button"
                onClick={() => openProjects("room", room._id)}
              >
                <span aria-hidden="true">├</span><strong>{room.name}</strong>
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
            onNavigateHome={() => setActiveSection("home")}
            onOpenProjects={(view) => openProjects(view)}
            onOpenRoom={(roomId) => openProjects("room", roomId)}
          />
        </div>
      </div>
    </main>
  );
}
