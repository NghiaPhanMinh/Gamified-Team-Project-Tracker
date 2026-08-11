import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 13 }, (_, index) => index + 8);

function timeLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const minute = String(minutes % 60).padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${minute}`;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function ProjectTeamMembers({ projectId }: { projectId: Id<"projects"> }) {
  const data = useQuery(api.availability.getForProject, { projectId });
  const updateMine = useMutation(api.availability.updateMine);
  const saveMeetingPlan = useMutation(api.availability.saveMeetingPlan);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [duration, setDuration] = useState("60");
  const [cadence, setCadence] = useState<"weekly" | "fortnightly" | "as_needed">("weekly");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const mine = useMemo(
    () => data?.members.find((member) => member.profileId === data.currentProfileId),
    [data],
  );

  /* Query-backed values intentionally hydrate this editable form when realtime data changes. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!data) return;
    const mineBlocks = data.blocks.filter((block) => block.profileId === data.currentProfileId);
    const next = new Set<string>();
    mineBlocks.forEach((block) => {
      for (let minute = block.startMinute; minute < block.endMinute; minute += 60) {
        next.add(`${block.dayOfWeek}-${minute}`);
      }
    });
    setSelected(next);
    setTimezone(mine?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    setDuration(String(mine?.meetingDurationMinutes ?? 60));
    setCadence(mine?.meetingCadence ?? "weekly");
  }, [data, mine]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggle(dayOfWeek: number, startMinute: number) {
    const key = `${dayOfWeek}-${startMinute}`;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setSaved(false);
  }

  function toBlocks() {
    const blocks: Array<{ dayOfWeek: number; startMinute: number; endMinute: number }> = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      const minutes = [...selected]
        .filter((key) => key.startsWith(`${dayOfWeek}-`))
        .map((key) => Number(key.split("-")[1]))
        .sort((a, b) => a - b);
      for (const minute of minutes) {
        const previous = blocks[blocks.length - 1];
        if (previous?.dayOfWeek === dayOfWeek && previous.endMinute === minute) {
          previous.endMinute += 60;
        } else {
          blocks.push({ dayOfWeek, startMinute: minute, endMinute: minute + 60 });
        }
      }
    }
    return blocks;
  }

  async function saveAvailability() {
    setError(null);
    setIsSaving(true);
    try {
      await updateMine({
        projectId,
        timezone,
        meetingDurationMinutes: Number(duration),
        meetingCadence: cadence,
        blocks: toBlocks(),
      });
      setSaved(true);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Your availability could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveSuggestion(suggestion: NonNullable<typeof data>["suggestions"][number]) {
    setError(null);
    setIsSaving(true);
    try {
      await saveMeetingPlan({
        projectId,
        title: "Team overlap meeting",
        dayOfWeek: suggestion.dayOfWeek,
        startMinute: suggestion.startMinute,
        durationMinutes: Math.min(Number(duration), suggestion.endMinute - suggestion.startMinute),
        timezone,
        attendeeProfileIds: suggestion.attendeeProfileIds,
        source: "deterministic",
      });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The meeting plan could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  if (!data) return <section className="team-members-tab" aria-busy="true">Loading team availability…</section>;

  return (
    <section className="team-members-tab" aria-labelledby="team-members-title">
      <header className="project-list-heading">
        <div><p className="card-eyebrow">Team Members</p><h3 id="team-members-title">Plan around real availability</h3></div>
      </header>

      <div className="member-profile-grid">
        {data.members.map((member) => (
          <article key={member.profileId} className="member-profile-card">
            {member.imageUrl ? <img src={member.imageUrl} alt="" /> : <span className="member-avatar">{initials(member.displayName)}</span>}
            <div><strong>{member.displayName}</strong><small>{member.workload} workload · {member.weeklyCapacity ?? "?"}h/week</small></div>
            <div className="skill-chip-list">{member.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </article>
        ))}
      </div>

      <section className="availability-editor" aria-labelledby="availability-title">
        <div><p className="card-eyebrow">My weekly calendar</p><h4 id="availability-title">Select the hours you are usually available</h4></div>
        <div className="availability-preferences">
          <label><span>Timezone</span><input value={timezone} onChange={(event) => setTimezone(event.target.value)} /></label>
          <label><span>Meeting duration</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">2 hours</option></select></label>
          <label><span>Cadence</span><select value={cadence} onChange={(event) => setCadence(event.target.value as typeof cadence)}><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="as_needed">As needed</option></select></label>
        </div>
        <div className="availability-calendar" role="grid" aria-label="Weekly availability from 8 AM to 9 PM">
          <span className="availability-corner" />
          {DAYS.map((day) => <strong key={day} role="columnheader">{day.slice(0, 3)}</strong>)}
          {HOURS.map((hour) => (
            <div className="availability-row" role="row" key={hour}>
              <span>{timeLabel(hour * 60)}</span>
              {DAYS.map((day, dayOfWeek) => {
                const key = `${dayOfWeek}-${hour * 60}`;
                return <button key={day} type="button" className={selected.has(key) ? "is-selected" : ""} aria-pressed={selected.has(key)} aria-label={`${day} ${timeLabel(hour * 60)} to ${timeLabel((hour + 1) * 60)}`} onClick={() => toggle(dayOfWeek, hour * 60)} />;
              })}
            </div>
          ))}
        </div>
        <button className="primary-button" type="button" disabled={isSaving} onClick={() => void saveAvailability()}>{isSaving ? "Saving…" : saved ? "Availability saved" : "Save availability"}</button>
      </section>

      <section className="meeting-overlap" aria-labelledby="meeting-overlap-title">
        <p className="card-eyebrow">Deterministic overlap</p>
        <h4 id="meeting-overlap-title">Best shared meeting windows</h4>
        <p>These slots come directly from the team calendars. AI may explain the options later, but it cannot replace this calculation.</p>
        {data.suggestions.length ? <div className="meeting-suggestion-grid">{data.suggestions.map((suggestion) => (
          <article key={`${suggestion.dayOfWeek}-${suggestion.startMinute}-${suggestion.endMinute}`}>
            <strong>{DAYS[suggestion.dayOfWeek]} · {timeLabel(suggestion.startMinute)}–{timeLabel(suggestion.endMinute)}</strong>
            <span>{suggestion.attendeeProfileIds.length} teammates overlap</span>
            <button className="quiet-button" type="button" disabled={isSaving} onClick={() => void saveSuggestion(suggestion)}>Save meeting plan</button>
          </article>
        ))}</div> : <div className="project-empty"><strong>No shared slot yet.</strong><p>Ask at least two teammates to add overlapping calendar hours.</p></div>}
        {data.plans.length ? <div className="saved-meeting-plans"><h5>Saved plans</h5>{data.plans.map((plan) => <span key={plan._id}>{DAYS[plan.dayOfWeek]} {timeLabel(plan.startMinute)} · {plan.durationMinutes} min · {plan.attendeeProfileIds.length} people</span>)}</div> : null}
      </section>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  );
}
