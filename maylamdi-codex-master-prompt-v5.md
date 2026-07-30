# MayLamDi — Codex Master Build Prompt V5 — Clean Start

## 0. Authority, scope, and working method

Build **MayLamDi**, a responsive, realtime web platform that helps university teams plan projects, allocate work fairly, track progress, and preserve contribution evidence across different academic majors.

This V5 prompt and `mldchecklist-v5.md` are the current source of truth.

The GitHub repository has intentionally been cleared. Treat it as a new project. Do not restore, inspect, copy, or migrate the deleted QuestBoard implementation from Git history, old branches, cached deployments, or previous generated files. Build MayLamDi cleanly from the requirements below.

### Features intentionally excluded from the new build

Do not add:

- username/password or magic-link authentication;
- a separate daily goblin-log or goblin-quota system;
- compulsory final PDF submission from every member;
- boss progress controlled only by member PDF approval;
- one permanent verifier assigned to each member;
- a two-project history cap;
- automatic deletion of useful project text after two projects;
- defeated/survived as the only project statuses;
- task count as a fairness score;
- AI allocation based only on unvalidated “common sense”;
- hard two-week project or task limits;
- false online-presence claims;
- punitive XP, public leaderboards, or teammate ranking.

Keep the playful game identity, character customisation, sounds, and optional boss visualisation as a presentation layer over a practical project-management system.

### Required implementation method

Do not produce one untested code dump.

Work in phases and update `mldchecklist-v5.md` honestly:

- `[ ]` not started
- `[~]` in progress
- `[x]` completed and tested
- `[!]` blocked or needs fixing

At the end of every phase report:

1. checklist section completed;
2. files changed;
3. packages installed or removed;
4. schema and index changes;
5. security checks added;
6. commands run;
7. tests passed;
8. tests failed;
9. manual dashboard/account actions still required;
10. next safe phase.

Stop when a mandatory foundation gate fails.

---

# 1. Existing project and services

## Repository

- GitHub: `https://github.com/NghiaPhanMinh/Gamified-Team-Project-Tracker`
- expected branch: `main`
- the previous website has been deleted;
- treat the current repository as an intentionally clean starting point;
- create the application in the repository root;
- do not recover old QuestBoard files or checkout old commits;
- do not create a nested Vite project such as `repo-name/repo-name`;
- preserve only files deliberately supplied for the new build, especially:
  - `maylamdi-codex-master-prompt-v5.md`
  - `mldchecklist-v5.md`
  - `public/assets/maylamdi-logo.png`.

## Existing Convex development deployment

- Convex project: `dms4`
- development deployment: `resilient-mastiff-759`
- development URL: `https://resilient-mastiff-759.convex.cloud`

Do not create another Convex project unless the existing deployment cannot be used and the user explicitly approves it.

## Hosting

- GitHub stores source code;
- Vercel hosts the React/Vite frontend;
- Convex Cloud provides database, functions, file storage, realtime subscriptions, authentication integration, and scheduled functions;
- Google Cloud Console provides Google OAuth credentials;
- OpenRouter provides optional hosted AI.

The public site must not depend on the user’s laptop or LM Studio. LM Studio may be supported only as an optional local development provider.

---

# 2. Product purpose

MayLamDi should make group projects feel shared rather than carried by one person.

It should help teams:

- upload or paste an assignment brief;
- choose a suitable project framework;
- break a long assignment into phases, milestones, tasks, and dependencies;
- collect member skills, availability, current workload, and preferences;
- generate explainable allocation suggestions;
- manually edit every allocation;
- track project progress over weeks or months;
- identify overdue work and workload imbalance early;
- submit contribution evidence where appropriate;
- request peer review only for tasks that need it;
- preserve an activity trail and contribution report;
- archive completed projects;
- use game-like visuals without turning teamwork into punishment or surveillance.

The platform must support creative majors and non-creative majors through framework templates rather than separate hard-coded applications.

---

# 3. Target audience

## Direct audience

Primarily university students aged 18–25 in project-heavy courses, including:

- Design
- Digital Media
- Film
- Animation
- Marketing
- Communications
- Business
- Entrepreneurship
- Architecture
- Spatial Design
- Software
- IT
- Academic Research

## Indirect audience

- lecturers;
- course coordinators;
- faculties;
- academic support staff;
- universities that need clearer evidence of contribution and project progress.

## Tone

- playful;
- culturally relevant;
- humorous in small doses;
- supportive rather than punitive;
- academically useful;
- fairness-first;
- clear about AI uncertainty;
- never shame, rank, or publicly label weak teammates.

---

# 4. Branding and supplied logo

A supplied PNG logo is included in the Codex pack at:

```text
public/assets/maylamdi-logo.png
```

Use this exact file in the website.

Requirements:

- use it on the landing page;
- use it in the main navigation;
- use it on the Google sign-in screen;
- use it in loading/empty states where appropriate;
- use it in generated PDF report headers;
- use it as the basis for favicon/app icon configuration if practical;
- preserve aspect ratio;
- never stretch or recolour the PNG;
- provide descriptive alt text: `MayLamDi logo`;
- provide a small-text fallback when the image cannot load.

Do not redraw, regenerate, or replace the supplied logo.

---

# 5. Visual system

## Colour palette

Create central theme tokens for:

- `#fff73f` — bright yellow
- `#feaa01` — orange
- `#ff8ae7` — soft pink
- `#fd39e4` — vivid magenta
- `#1dd851` — bright green
- `#17a738` — deep green
- `#4ca0fe` — blue
- `#fffded` — cream
- `#121f25` — deep navy

Do not scatter repeated hard-coded values throughout components.

## Light mode

- page background: `#fffded`
- primary text: `#121f25`
- use palette colours for cards, tags, buttons, characters, progress, and illustrations;
- preserve readable contrast.

## Dark mode

- page background: `#121f25`
- primary text: `#fffded`
- use accent colours selectively;
- avoid turning every element into a neon block;
- maintain surface hierarchy.

## Theme behaviour

- visible light/dark toggle;
- first-run default may follow system preference;
- preference persists across refreshes;
- no severe incorrect-theme flash where practical;
- theme is a local display preference, not shared team data.

## Typography

- headings: **Blode Starkly**
- body/interface: **Glacial Indifference**

Rules:

- do not download or redistribute font files;
- use the fonts only if licensed files already exist in the repository;
- otherwise use documented fallbacks;
- missing fonts must not break layout;
- keep the supplied logo as an image rather than trying to reproduce its lettering with CSS.

## Component style

- rounded blocks;
- thick coloured borders;
- strong navy outlines;
- energetic but organised layouts;
- high-contrast controls;
- playful micro-interactions;
- accessible focus states;
- responsive spacing;
- no colour-only status communication.

---

# 6. Character customisation

Each user can customise a personal character separately within each team.

Use the supplied palette only.

Character configuration:

- fill colour;
- outline colour;
- optional spell type or icon;
- visible initials or display name;
- fill and outline cannot be identical;
- thick rounded outline;
- live preview;
- saved to that user’s `teamMembers` record;
- updates live for teammates.

Suggested fields:

```text
characterFillColor
characterOutlineColor
spellType
```

Backend requirements:

- validate colours against the approved palette;
- reject arbitrary CSS;
- reject identical fill and outline;
- require team membership;
- log changes in the activity feed.

A user may use different character colours in different teams.

---

# 7. Framework template system

Do not build a different allocation algorithm for each major.

Build:

1. reusable framework templates;
2. one shared allocation engine;
3. optional AI interpretation and adaptation;
4. one Custom Framework builder.

Frameworks define typical phases, deliverables, skills, dependencies, and review points. They are not rigid locked workflows.

## 7.1 Design and Creative — Nonlinear Design Process

Suggested phases:

- Empathise
- Define / Research
- Ideate
- Prototype
- Test
- Refine
- Deliver

Behaviour:

- phases may overlap;
- testing can return work to research, ideation, or prototyping;
- useful for UX/UI, graphic design, product design, digital media, and interaction design.

## 7.2 Marketing and Communications — Campaign Development

Suggested phases:

- Situation and Audience Research
- Strategy and Objectives
- Concept Development
- Content Production
- Channel Planning
- Launch
- Measurement and Optimisation

Useful outputs:

- audience profile;
- competitor review;
- campaign idea;
- content plan;
- media/channel plan;
- performance report.

## 7.3 Business and Entrepreneurship — Business Project Framework

Suggested phases:

- Problem or Opportunity Identification
- Market and Stakeholder Research
- Solution or Business Model
- Financial and Operational Planning
- Risk Assessment
- Implementation Proposal
- Evaluation and Presentation

Useful outputs:

- market analysis;
- business model;
- operating plan;
- budget;
- risk register;
- final pitch.

## 7.4 Architecture and Spatial Design — Architectural Design Process

Suggested phases:

- Site and Context Analysis
- User and Programme Research
- Concept Development
- Schematic Design
- Design Development
- Technical Documentation
- Visualisation and Presentation
- Review and Revision

Behaviour:

- nonlinear;
- technical constraints may send work back to concept or schematic design;
- tasks may depend on drawings, models, site research, and regulation checks.

## 7.5 Film, Animation, and Media Production — Production Pipeline

Suggested phases:

- Development
- Research and Script
- Pre-production
- Production
- Post-production
- Testing and Revision
- Distribution or Presentation

Useful dependencies:

- script before storyboard;
- storyboard before shot/animation production;
- production assets before editing;
- edit before final sound and export.

## 7.6 Software and IT — Agile Development

Suggested phases:

- Requirements
- Backlog and Planning
- UX / Technical Design
- Development
- Testing
- Deployment
- Review and Iteration

Behaviour:

- support sprints;
- support backlog tasks;
- allow iterative loops;
- support dependencies and blockers.

## 7.7 Academic Research — Research Project Framework

Suggested phases:

- Research Question
- Literature Review
- Methodology
- Ethics / Preparation where relevant
- Data Collection
- Analysis
- Discussion
- Writing
- Review and Submission

Useful outputs:

- research question;
- source matrix;
- method;
- dataset;
- analysis;
- draft;
- final report.

## 7.8 Custom Framework

Users can:

- name the framework;
- add, rename, reorder, and remove phases;
- mark phases as optional;
- define suggested deliverables;
- define common skills;
- define dependencies;
- mark phases that may overlap;
- add review checkpoints;
- save the custom framework for the team;
- reuse it in future projects;
- duplicate and edit an existing preset.

Custom frameworks use the same allocation engine as presets.

## Framework data requirements

Each template should support:

```ts
{
  id,
  name,
  description,
  disciplines,
  isBuiltIn,
  phases: [
    {
      id,
      name,
      description,
      suggestedDeliverables,
      suggestedSkills,
      canOverlap,
      defaultDependencies,
      reviewCheckpoint
    }
  ]
}
```

Built-in templates may be versioned constants in code. User-created templates must be stored in Convex.

---

# 8. Long-running project structure

The website must support projects that last weeks or months.

Do not force the entire project into a two-week limit.

Use this hierarchy:

```text
Team
  → Project
      → Phases
          → Milestones
              → Tasks
                  → Optional subtasks/checkpoints
```

## Duration guidance

- project: may last several months;
- phase: commonly 1–4 weeks;
- milestone: a meaningful review or output point;
- task: recommended to be 1–14 days;
- task longer than 14 days triggers a suggestion to break it down;
- 14 days is guidance, not a hard validation rule.

Example message:

> This task lasts longer than two weeks. Consider creating smaller checkpoints so progress is easier to track.

The user may keep the longer task.

## Long-term data behaviour

- active project data must never disappear because users close the browser;
- data is stored in Convex Cloud;
- users can return on another device and continue;
- use pagination for large task/activity lists;
- archive completed projects;
- do not hard-delete useful text history after only two projects;
- allow users to export and manually delete archived projects;
- recommend external links for large Figma, Drive, GitHub, or video assets;
- do not upload large source files or videos in the MVP.

## Storage controls

Suggested prototype limits:

- evidence PDF: 10 MB maximum;
- evidence image: 5 MB maximum;
- no video upload;
- allow external URLs for Figma, Drive, GitHub, Miro, Adobe, or other tools;
- delete replaced files where safe;
- delete files when a project is permanently deleted;
- keep text records, task metadata, and activity logs paginated.

---

# 9. Technical stack

Use:

- React
- Vite
- TypeScript where supported
- Tailwind CSS
- Convex React
- Convex database
- Convex Auth
- Convex file storage
- Convex scheduled functions
- date-fns
- jsPDF or pdf-lib
- Web Audio API
- OpenRouter through a Convex action
- Vercel
- GitHub

Do not add:

- Firebase;
- Supabase;
- a separate Express server;
- a second database;
- direct browser calls to OpenRouter;
- production dependence on localhost or LM Studio.

All persistent shared data must use Convex queries, mutations, or actions.

React/local storage may hold only temporary form state and local preferences such as theme, sound, and reduced animation.

---

# 10. Environment variables

Never commit real values.

## Frontend

```env
VITE_CONVEX_URL=
```

## Convex server

Use exact names required by the installed Convex Auth version. Expected values include:

```text
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
OPENROUTER_API_KEY
OPENROUTER_MODEL
OPENROUTER_FALLBACK_MODEL
```

AI defaults:

```text
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_FALLBACK_MODEL=openrouter/free
```

## Vercel

```text
CONVEX_DEPLOY_KEY
```

Create/update:

- `.env.example` with names only;
- `.gitignore` including `.env` and `.env.local`;
- README setup instructions without secret values.

Never expose:

- Google client secret;
- OpenRouter key;
- Convex deploy key;
- GitHub token;
- Vercel token.

---

# 11. Mandatory foundation gates

## Phase 0 — Clean repository bootstrap

Before product features:

1. inspect only the files currently present in the cleared repository;
2. confirm that no previous app implementation needs migration;
3. do not recover deleted QuestBoard code from Git history;
4. create a React + Vite + TypeScript application in the repository root;
5. configure Tailwind CSS using the current setup compatible with the installed Vite version;
6. establish a clear folder structure for pages, components, hooks, utilities, design tokens, audio, framework templates, and Convex functions;
7. copy or preserve the supplied logo at `public/assets/maylamdi-logo.png`;
8. create `.env.example`, update `.gitignore`, and document setup;
9. install only the dependencies required by this specification;
10. run the new scaffold locally and produce the first successful build.

Suggested clean structure:

```text
/
├─ public/
│  └─ assets/
│     └─ maylamdi-logo.png
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  ├─ pages/
│  ├─ hooks/
│  ├─ lib/
│  ├─ styles/
│  └─ main.tsx
├─ convex/
├─ .env.example
├─ package.json
├─ README.md
├─ maylamdi-codex-master-prompt-v5.md
└─ mldchecklist-v5.md
```

The exact internal folders may be adjusted, but avoid an unstructured single-file application.

## Phase 1 — Convex connection gate

Do not build product features until:

- repository links to the existing development deployment;
- React provider is correct;
- one test query works;
- function appears in Convex dashboard;
- function calls appear in Logs/Health;
- build passes;
- no secret is committed.

## Phase 2 — Google authentication gate

Do not build project features until:

- Google sign-in works;
- first login creates one app profile;
- returning login reuses it;
- refresh preserves session;
- sign-out works;
- protected backend calls reject signed-out users.

Codex must output the exact:

- localhost origin;
- Vercel origin;
- Google OAuth callback URI;
- required Convex environment variable names;
- manual Google Cloud and Convex dashboard steps.

## Phase 3 — Realtime team gate

Do not continue until two authenticated accounts in separate sessions:

- join the same team;
- see membership updates within 1–2 seconds;
- see a shared test record update without refresh;
- pass backend team-authorisation checks.

---

# 12. Google authentication

Use Convex Auth with Google only for this MVP.

Requirements:

- Continue with Google;
- sign-out;
- signed-out/loading/authenticated states;
- basic OpenID, email, and profile scopes only;
- no Gmail inbox access;
- no Drive/Calendar scope unless explicitly added in a future version;
- no username/password;
- no magic link;
- no local-only session.

On first login:

- create one `userProfiles` record;
- link it to authenticated Convex identity;
- store display name, email, optional image URL, created/updated times;
- make creation idempotent.

Every protected backend function must derive the actor from `ctx.auth`.

Create reusable helpers:

- `requireAuthUser`
- `requireUserProfile`
- `requireTeamMember`
- `requireProjectMember`
- `requireTaskOwnerOrTeamPermission`
- `requireTaskReviewer`

Frontend button visibility is not security.

---

# 13. Suggested Convex data model

Use explicit validators and indexes. Avoid `v.any()` for important structures.

## `userProfiles`

- auth user ID
- display name
- email
- optional profile image
- created time
- updated time

## `teams`

- name
- join code
- creator
- created time

## `teamMembers`

- team ID
- user ID
- role
- joined time
- character fill
- character outline
- optional spell type
- optional default skills/preferences

## `customFrameworks`

- team ID
- creator ID
- name
- description
- phases
- created time
- updated time
- version

## `projects`

- team ID
- title
- description
- framework type
- built-in framework key or custom framework ID
- start date
- deadline
- status: `planning | active | at_risk | overdue | completed | archived`
- creator ID
- created/updated/completed times
- optional featured boss visual state

Allow multiple projects per team. Paginate the list.

## `projectMembers`

- project ID
- user ID
- skills
- availability
- current workload
- preferences
- optional weekly capacity
- joined time

This allows planning information to differ by project.

## `phases`

- project ID
- framework phase key
- title
- description
- order
- start date
- end date
- status
- can overlap
- review checkpoint

## `milestones`

- project ID
- phase ID
- title
- description
- due date
- status
- required task IDs
- completed time

## `tasks`

- project ID
- phase ID
- optional milestone ID
- title
- description
- primary owner ID
- collaborator IDs
- required skills
- estimated effort
- difficulty 1–5
- weight
- start date
- due date
- status: `todo | in_progress | blocked | review | completed`
- dependency task IDs
- source: `manual | template | ai`
- requires review
- optional reviewer ID
- created by
- created/updated/completed times

## `taskEvidence`

- task ID
- submitter ID
- type: `note | link | image | pdf`
- optional note
- optional URL
- optional storage ID
- submitted time

## `taskReviews`

- task ID
- reviewer ID
- status: `pending | approved | changes_requested`
- optional comment
- reviewed time

Only tasks with `requiresReview=true` need a reviewer.

## `activityLogs`

- team ID
- project ID
- actor ID
- action
- typed metadata
- timestamp

## `projectSnapshots`

Create a typed snapshot when a project is archived or exported.

Include:

- project;
- selected framework;
- phases;
- milestones;
- tasks;
- project members and planning inputs;
- evidence metadata;
- reviews;
- activity summary;
- contribution summary.

## Recommended indexes

Add indexes for:

- team by join code;
- team members by team;
- team members by user;
- team member by team and user;
- custom frameworks by team;
- projects by team and status;
- projects by team and updated time;
- project members by project;
- project member by project and user;
- phases by project and order;
- milestones by project and due date;
- tasks by project;
- tasks by project and owner;
- tasks by project and status;
- evidence by task;
- reviews by task;
- activity by project and timestamp;
- snapshots by project.

---

# 14. Team and project flow

## Team flow

A signed-in user can:

- create a team;
- receive a short unique join code;
- join a team using a code;
- see members update live;
- customise their character;
- view all active and archived team projects.

## Project creation

Use one consolidated responsive setup page, not a rigid wizard.

Sections:

1. project details;
2. framework selection;
3. project member inputs;
4. phase and milestone preview;
5. task plan;
6. allocation suggestions;
7. final review and confirmation.

The page may use collapsible sections but should submit one confirmed project plan.

## Framework selection

Options:

- Design and Creative
- Marketing and Communications
- Business and Entrepreneurship
- Architecture and Spatial Design
- Film, Animation, and Media Production
- Software and IT
- Academic Research
- Custom Framework

Allow:

- preview;
- duplicate;
- edit before use;
- AI recommendation;
- manual choice.

## Project dates

- support projects lasting months;
- start date and deadline;
- optional phase dates;
- milestone due dates;
- task due dates;
- no hard two-week project restriction.

---

# 15. Allocation engine

Do not rely on AI common sense alone.

Use deterministic allocation logic plus optional AI interpretation.

## AI responsibilities

AI may:

- read the assignment brief;
- recommend a framework;
- extract deliverables;
- suggest phases, milestones, and tasks;
- suggest skills;
- suggest dependencies;
- estimate effort and difficulty;
- propose owners;
- explain suggestions;
- suggest task breakdown when work is too broad.

## Application responsibilities

Backend/application logic must:

- validate owners are project members;
- respect availability;
- consider current workload;
- match required skills;
- consider preferences;
- avoid assigning overlapping heavy tasks to one person;
- validate dependencies;
- ensure every required task has an owner;
- calculate workload summaries;
- flag imbalance;
- produce consistent explanations.

## Suggested scoring model

Use a transparent configurable score, for example:

```text
skill match:        0–40
availability fit:   0–25
workload balance:   0–20
preference fit:     0–10
dependency timing:  0–5
```

Apply hard constraints before scoring.

Do not present the score as objective fairness.

Example explanation:

> Suggested for Linh because video editing is one of her selected skills, her planned workload is lower during this phase, and she is available before the post-production milestone.

## Human control

The team can:

- swap owners;
- add collaborators;
- divide tasks;
- merge tasks;
- edit effort;
- change difficulty;
- edit dates;
- change dependencies;
- reject all AI suggestions;
- create the whole plan manually.

Every accepted allocation is a team decision.

---

# 16. Nonlinear workflow support

Do not lock phases into a one-way sequence.

Support:

- overlapping phases;
- dependencies between specific tasks;
- tasks that return to an earlier phase;
- revision cycles;
- blocked states;
- repeated testing/review;
- re-opened completed tasks with an activity record.

The interface may use:

- phase timeline;
- dependency-aware board;
- list view;
- workload view.

Do not require a complex graph editor for the MVP. A clear dependency selector and visual indicators are sufficient.

---

# 17. Task management

Provide:

- create/edit/delete task;
- primary owner;
- collaborators;
- required skills;
- estimated effort;
- difficulty;
- weight;
- start and due date;
- dependencies;
- phase and milestone;
- todo/in-progress/blocked/review/completed;
- optional review requirement;
- optional evidence;
- comments or short updates if feasible;
- owner/status/phase filters;
- search;
- paginated or virtualised lists when large;
- responsive cards.

Rules:

- task quantity is not an effort score;
- weight and estimated effort are editable;
- task completion alone should not generate punitive comparison;
- changes update live;
- all important changes are logged.

For tasks longer than 14 days:

- show a breakdown suggestion;
- allow user to continue;
- optionally ask AI to generate subtasks;
- do not reject the task.

---

# 18. Review and contribution evidence

Evidence must be flexible across majors.

Supported evidence:

- short note;
- external link;
- image;
- PDF.

Examples:

- Figma link;
- Google Drive link;
- GitHub commit/PR link;
- Miro link;
- campaign document;
- drawing PDF;
- screenshot;
- report section.

Review rules:

- review is optional per task;
- one reviewer may be assigned when review is required;
- no self-review;
- reviewer must be a project member;
- reviewer can approve or request changes;
- evidence is visible only to authorised team members;
- changes requested returns task to an editable/review state.

Do not require every task to have a PDF.

Contribution reports should show:

- owned tasks;
- collaborator tasks;
- effort/weight;
- status history;
- evidence;
- review outcomes;
- dates;
- activity.

Clearly state that reports support reflection and transparency but cannot perfectly measure effort.

---

# 19. Project progress and game layer

Use practical progress as the source of truth.

Project progress may be calculated from weighted required tasks and milestones.

Example:

```text
completed required task weight / total required task weight
```

Optional boss visual:

- project is represented as a boss;
- weighted progress reduces visual boss health;
- completing a milestone causes a stronger animation;
- completing the project triggers “boss defeated” celebration;
- overdue project may show “boss still standing”;
- database status remains practical: active, at risk, overdue, completed, archived.

Do not make game visuals block project actions.

Do not use a separate goblin logging system.

Tasks themselves may be called “quests” in playful interface copy, but store them as tasks in the backend.

---

# 20. At-risk and rebalancing support

Use deterministic checks first.

Flag situations such as:

- overdue task;
- blocked dependency;
- member workload significantly above team average;
- multiple high-effort tasks due at the same time for one member;
- milestone at risk;
- no owner;
- required review pending too long.

Offer:

- reassign task;
- add collaborator;
- split task;
- move due date if permitted;
- ask AI for a rebalance suggestion.

AI rebalancing must be user-triggered, editable, and never automatic.

No automatic recurring AI monitoring.

---

# 21. Activity and notifications

Log:

- team created;
- member joined;
- character changed;
- framework created/edited;
- project created;
- phase or milestone changed;
- task created;
- task assigned/reassigned;
- status changed;
- evidence submitted;
- review approved;
- changes requested;
- task reopened;
- project marked at risk;
- project completed;
- project archived;
- project deleted.

Use UTC storage and local display time.

Provide in-app notifications for important new events. Do not claim push notifications unless implemented.

---

# 22. Sound design

Create a central sound manager using Web Audio API.

Requirements:

- visible sound on/off;
- optional volume;
- preference persists;
- no autoplay before user gesture;
- no copyrighted audio files required;
- graceful fallback;
- no sound for failed mutations;
- no repeated sounds caused by rerenders;
- do not replay old activity events after page load.

Suggested sounds:

- normal button: bubbly pop;
- member joined: sparkle;
- character saved: soft twinkle;
- project created: celebratory flourish;
- framework selected: page flip/chime;
- task created: rising pop;
- task assigned: soft chime;
- task completed: bright success pop;
- evidence submitted: whoosh/pop;
- review approved: success chord;
- changes requested: gentle neutral boop;
- milestone completed: short fanfare;
- project completed: celebratory arpeggio;
- overdue warning: subtle neutral alert, not an alarm;
- AI suggestion ready: magic sparkle.

Respect reduced-motion and muted settings.

---

# 23. AI-assisted planning

Build last.

Use a Convex server action.

Default:

```text
google/gemma-4-26b-a4b-it:free
```

Fallback:

```text
openrouter/free
```

Requirements:

- explicit user-triggered action;
- no background AI calls;
- configurable model;
- timeout;
- rate-limit handling;
- unavailable-model handling;
- invalid-output handling;
- manual fallback;
- strict server-side validation;
- no direct browser key exposure;
- do not send private evidence files to AI.

AI inputs may include:

- assignment brief text;
- chosen or candidate framework;
- deadline;
- project members;
- skills;
- availability;
- workload;
- preferences.

AI output schema should include:

- recommended framework and reason;
- phases;
- milestones;
- tasks;
- dependencies;
- required skills;
- estimated effort;
- difficulty;
- suggested owners/collaborators;
- allocation explanations;
- suggested review requirements;
- breakdown suggestions for long tasks;
- risks and assumptions.

Nothing is saved until the team confirms.

---

# 24. Pages and main interface

Build at minimum:

## Public

- landing page;
- Google sign-in page;
- concise product explanation;
- supplied logo;
- light/dark mode;
- responsive navigation.

## Authenticated

- profile/onboarding;
- team create/join;
- team home;
- project list;
- archived project list;
- character settings;
- custom framework library;
- create project;
- project overview;
- phase/milestone view;
- task board/list;
- workload view;
- contribution/evidence view;
- activity view;
- project report/export;
- team settings.

## Project workspace tabs

Suggested:

- Overview
- Plan
- Tasks
- Workload
- Evidence
- Activity
- Report

Keep navigation usable on mobile.

---

# 25. PDF and export

Generate client-side PDF reports.

Use supplied MayLamDi logo in the header.

Include:

- team;
- project;
- framework;
- dates;
- phases;
- milestones;
- tasks;
- owners and collaborators;
- estimated effort/weight;
- task history;
- evidence summary;
- review outcomes;
- activity summary;
- contribution summary;
- project status.

Support:

- active project report;
- archived project report;
- multi-page output;
- wrapped long text;
- desktop and mobile download.

Also provide JSON export for project data if practical.

Do not include private file URLs that should not leave the team.

---

# 26. Archive and deletion

Do not use the old two-project history cap.

Requirements:

- completed projects can be archived;
- archive is paginated;
- archived text data remains accessible;
- users can export before deletion;
- permanent delete requires explicit confirmation;
- deletion removes related uploaded files;
- deletion is authorised and idempotent;
- active projects are never auto-deleted;
- old text records are not deleted merely to save minimal storage.

If a free-tier safety limit is needed, make it a documented configurable constant rather than hidden behaviour.

---

# 27. Responsive design and accessibility

Support down to 320 px.

Requirements:

- mobile-first layout;
- desktop grids where useful;
- no horizontal overflow;
- touch-friendly controls;
- visible labels;
- visible focus;
- keyboard navigation;
- accessible dialogs;
- screen-reader status updates;
- SVG titles and labels;
- colour-independent status;
- contrast checks;
- reduced motion;
- accessible theme and sound toggles;
- accessible character selector;
- accessible framework selector;
- accessible file inputs.

---

# 28. Security and privacy

Backend enforcement is mandatory.

- derive actor from auth;
- enforce team membership;
- enforce project membership;
- validate owners/collaborators/reviewers;
- prohibit self-review;
- validate palette colours;
- validate framework ownership;
- validate dependencies;
- validate file type and size;
- authorise file URL generation;
- prevent duplicate joins;
- prevent unauthorised project deletion;
- prevent direct frontend forgery of actor IDs;
- rate-limit or guard AI generation;
- keep secrets server-side;
- collect only basic Google identity;
- explain team visibility of evidence;
- avoid surveillance language.

---

# 29. Error and edge cases

Handle clearly:

- missing Convex URL;
- Convex disconnected;
- OAuth cancelled;
- OAuth redirect mismatch;
- expired session;
- missing profile;
- invalid join code;
- duplicate join;
- missing team;
- missing project;
- non-member access;
- deleted framework;
- invalid custom framework;
- empty project plan;
- no task owner;
- invalid collaborator;
- invalid reviewer;
- self-review;
- invalid dependency;
- circular dependency;
- task longer than 14 days;
- due date outside project;
- upload failure;
- wrong file type;
- oversized file;
- duplicate submission;
- review after deletion;
- AI timeout;
- AI rate limit;
- model unavailable;
- invalid AI JSON;
- offline/reconnect;
- audio unavailable;
- logo load failure.

Never silently fail.

---

# 30. Testing requirements

## Backend tests

- auth helper protection;
- profile idempotency;
- join code uniqueness;
- duplicate membership prevention;
- team authorisation;
- project authorisation;
- character palette validation;
- custom framework ownership;
- phase ordering;
- task dependency validation;
- circular dependency handling;
- owner/collaborator validation;
- no self-review;
- evidence access;
- archive/delete authorisation;
- storage cleanup selection;
- allocation scoring;
- AI schema validation.

## Realtime two-session tests

Two separate authenticated accounts:

- team join updates;
- character update;
- project creation;
- framework selection;
- task creation;
- task assignment;
- task status;
- evidence submission;
- review status;
- workload summary;
- project completion;
- archive.

All without manual refresh.

## UI tests

- light mode;
- dark mode;
- theme persistence;
- sound toggle;
- sound persistence;
- logo use;
- character selector;
- every built-in framework;
- custom framework;
- long project;
- >14-day task suggestion;
- mobile;
- keyboard;
- reduced motion;
- PDF export;
- AI unavailable fallback.

## Build checks

Run configured:

- install;
- Convex generation/dev;
- type check;
- lint;
- tests;
- production build.

Do not call a feature tested when only compilation passed.

---

# 31. Production deployment

Development must pass first.

Codex must provide manual instructions for:

- Google OAuth origins and callback;
- Convex development variables;
- Convex production variables;
- Vercel `CONVEX_DEPLOY_KEY`;
- production Convex deployment;
- Vercel build command;
- production Google sign-in test;
- production realtime test;
- production file upload test;
- production OpenRouter test.

Do not claim to modify Google Cloud, Convex dashboard, or Vercel dashboard unless the environment actually allows it.

---

# 32. Definition of done

A user can:

1. open MayLamDi and see the supplied logo;
2. use light or dark mode;
3. sign in with Google;
4. create or join a team;
5. customise a two-colour character;
6. see teammate updates live;
7. create a custom framework or choose one of seven presets;
8. create a project lasting weeks or months;
9. enter skills, availability, workload, and preferences;
10. optionally ask AI to interpret the brief;
11. review and edit phases, milestones, tasks, dependencies, and allocations;
12. confirm the plan;
13. manage tasks over time;
14. receive a suggestion to split tasks longer than two weeks;
15. attach notes, links, images, or PDFs as evidence;
16. request review only where needed;
17. see workload and at-risk indicators;
18. trigger optional rebalancing suggestions;
19. complete milestones and the project;
20. see optional boss/quest celebrations;
21. hear optional subtle UX sounds;
22. archive and reopen project records;
23. download a branded report;
24. keep using the manual workflow when AI is unavailable.

---

# 33. Start instruction for Codex

Start with the clean bootstrap and foundation gates.

1. Read this prompt and `mldchecklist-v5.md`.
2. Inspect only the current cleared repository contents.
3. Confirm that `public/assets/maylamdi-logo.png` exists.
4. Do not restore or copy the deleted QuestBoard website.
5. Scaffold React + Vite + TypeScript in the repository root.
6. Configure Tailwind and the base design tokens.
7. Add the initial folder structure, `.env.example`, `.gitignore`, and README.
8. Run the new scaffold and production build.
9. Connect the clean application to the existing Convex development deployment.
10. Implement and test the Convex connection gate.
11. Update only the completed checklist items.
12. Stop and report any failure before authentication or product features.

After the Convex gate passes, continue with Google authentication, the realtime team gate, and then later product phases. Do not generate every page before the foundation is tested.
