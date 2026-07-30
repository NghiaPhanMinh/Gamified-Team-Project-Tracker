# MLD Checklist V5 — MayLamDi Clean Start

Use this file as the implementation, prompting, and testing tracker for the clean-start MayLamDi specification. The previous website was intentionally deleted and must not be restored.

## Status key

- [ ] Not started
- [~] In progress
- [x] Completed and tested
- [!] Blocked or needs fixing

---

# 0. Current Product Decisions

- [x] Product name is MayLamDi everywhere
- [x] Repository is treated as a clean start
- [x] Deleted QuestBoard code is never restored
- [x] No migration plan is required
- [x] Supplied logo is used from `public/assets/maylamdi-logo.png`
- [x] Google sign-in is the only MVP authentication method
- [x] Convex is the only application backend/database
- [ ] Vercel hosts the frontend
- [ ] OpenRouter AI is optional
- [ ] Manual planning works without AI
- [ ] Seven built-in frameworks exist
- [ ] One Custom Framework feature exists
- [ ] One shared allocation engine serves all frameworks
- [ ] AI does not allocate by “common sense” alone
- [ ] Long-running projects are supported
- [ ] Tasks over 14 days receive a breakdown suggestion
- [ ] Two weeks is guidance, not a hard limit
- [ ] Projects and text history are not capped at two
- [ ] Separate goblin logging is not included
- [ ] Goblin quota logic is not included
- [ ] Compulsory final PDF share per member is not included
- [ ] Review is optional per task
- [ ] Task evidence supports note, link, image, and PDF
- [ ] Practical statuses replace defeated/survived as core database states
- [ ] Boss/quest language remains optional presentation only
- [ ] No public teammate leaderboard
- [ ] No punitive XP
- [ ] No automatic recurring AI monitoring
- [ ] No unlicensed font or sound downloads

---

# 1. Codex Pack Files

- [x] `maylamdi-codex-master-prompt-v5.md` is in repository root
- [x] `mldchecklist-v5.md` is in repository root
- [x] `public/assets/maylamdi-logo.png` exists
- [x] Logo opens correctly
- [x] Logo is not stretched or recoloured
- [x] Logo has alt text
- [x] Logo has a text fallback

---

# 2. Clean Repository Bootstrap

## Clean Start Confirmation

- [x] Previous website is intentionally deleted
- [x] No migration is required
- [x] Old QuestBoard commits are not restored
- [x] Old branches are not used as implementation sources
- [x] No deleted files are copied from cached deployments
- [x] Current repository contents are reviewed only to preserve new supplied files
- [x] New app is created in repository root
- [x] No nested duplicate project directory

## New Application Scaffold

- [x] React created
- [x] Vite created
- [x] TypeScript configured
- [x] Tailwind configured
- [x] `src/main.tsx` exists
- [x] `src/App.tsx` or app entry exists
- [x] Base routing approach selected
- [x] Public asset directory exists
- [x] Supplied logo exists at `public/assets/maylamdi-logo.png`
- [x] Design-token structure exists
- [x] Feature/component folder structure exists
- [x] Convex folder prepared
- [x] `.env.example` created
- [x] `.gitignore` created or updated
- [x] README created or updated
- [x] New scaffold starts locally
- [x] New production build passes

## Dependency Setup

- [x] Only required dependencies installed
- [x] Package versions are compatible
- [x] No Firebase dependency
- [x] No Supabase dependency
- [x] No Express backend dependency
- [x] No obsolete QuestBoard package dependency
- [~] Lockfile committed with project files

## Bootstrap Report

- [~] Codex lists files created
- [~] Codex lists packages installed
- [~] Codex lists commands run
- [~] Codex reports build result
- [~] Codex reports manual setup still needed
- [x] Product features do not begin before scaffold succeeds

---

# 3. Foundation and Convex Connection

## Setup

- [x] React + Vite runs
- [x] Tailwind works
- [x] TypeScript works if configured
- [x] Convex package installed
- [x] Existing Convex development deployment linked
- [x] `.env.local` has `VITE_CONVEX_URL`
- [x] `.env.example` has names only
- [x] `.env` ignored
- [x] `.env.local` ignored
- [x] No secrets committed
- [x] README setup updated

## Convex Gate

- [x] `npx convex dev` runs
- [x] Generated API types exist
- [x] Correct React provider
- [x] Missing URL error is clear
- [x] Test query returns data
- [x] Function appears in Convex dashboard
- [x] Calls appear in Logs/Health
- [x] Build passes
- [x] No recurring console errors
- [x] Product features wait until gate passes

---

# 4. Branding and Themes

## Logo

- [ ] Landing page
- [ ] Sign-in page
- [ ] Navigation
- [ ] Loading/empty state
- [ ] PDF header
- [ ] Favicon/app icon if practical
- [ ] Aspect ratio preserved
- [ ] No recolouring
- [ ] Accessible alt text
- [ ] Load-failure fallback

## Colour Tokens

- [ ] `#fff73f`
- [ ] `#feaa01`
- [ ] `#ff8ae7`
- [ ] `#fd39e4`
- [ ] `#1dd851`
- [ ] `#17a738`
- [ ] `#4ca0fe`
- [ ] `#fffded`
- [ ] `#121f25`
- [ ] Central token file
- [ ] No unnecessary repeated hardcoding

## Light Mode

- [ ] Background `#fffded`
- [ ] Text `#121f25`
- [ ] Readable cards
- [ ] Readable inputs
- [ ] Readable disabled states
- [ ] Contrast checked

## Dark Mode

- [ ] Background `#121f25`
- [ ] Text `#fffded`
- [ ] Selective accent use
- [ ] Surface hierarchy
- [ ] Readable inputs
- [ ] Contrast checked

## Theme Behaviour

- [ ] Toggle exists
- [ ] System default supported
- [ ] Preference persists
- [ ] No severe theme flash
- [ ] Works before login
- [ ] Works after login

## Typography

- [ ] Blode Starkly specified for headings
- [ ] Glacial Indifference specified for body
- [ ] Licensed files only
- [ ] No automatic font downloads
- [ ] Heading fallback documented
- [ ] Body fallback documented
- [ ] Missing fonts do not break UI

---

# 5. Google Authentication

## Google Cloud Manual Setup

- [x] Google Cloud project exists
- [x] Branding complete
- [x] Audience External
- [x] Testing mode
- [x] Test users added
- [x] OpenID scope only
- [x] Email scope only
- [x] Profile scope only
- [x] OAuth web client created
- [x] Local origin registered
- [ ] Production origin registered
- [x] Exact callback registered
- [x] Client ID stored privately
- [x] Client secret stored privately

## Convex Auth

- [x] Compatible package version confirmed
- [x] Google provider configured
- [x] Continue with Google button
- [x] Sign-out button
- [x] Signed-out state
- [x] Loading state
- [x] Authenticated state
- [x] No username/password
- [x] No magic link
- [x] No local fake session
- [x] Secret not exposed to React

## Profile

- [x] First login creates profile
- [x] Profile linked to authenticated identity
- [x] Returning login reuses profile
- [x] Creation is idempotent
- [x] Display name saved
- [x] Email saved
- [x] Optional profile image handled
- [x] Created time saved
- [x] Updated time saved
- [x] Email is not sole identity

## Auth Helpers

- [x] `requireAuthUser`
- [x] `requireUserProfile`
- [ ] `requireTeamMember`
- [ ] `requireProjectMember`
- [ ] `requireTaskOwnerOrTeamPermission`
- [ ] `requireTaskReviewer`

## Auth Gate Test

- [x] Account A signs in
- [x] Account B signs in
- [ ] OAuth cancel handled
- [x] Refresh persists session
- [x] Sign-out works
- [x] Signed-out query rejected
- [x] Signed-out mutation rejected
- [x] No duplicate profile
- [x] Project features wait until gate passes

---

# 6. Convex Data Architecture

## Tables

- [x] `userProfiles`
- [ ] `teams`
- [ ] `teamMembers`
- [ ] `customFrameworks`
- [ ] `projects`
- [ ] `projectMembers`
- [ ] `phases`
- [ ] `milestones`
- [ ] `tasks`
- [ ] `taskEvidence`
- [ ] `taskReviews`
- [ ] `activityLogs`
- [ ] `projectSnapshots`

## Validation

- [x] Explicit validators
- [ ] No important `v.any()`
- [ ] Convex IDs used
- [ ] Storage IDs used for files
- [x] All public args validated
- [~] All indexes generated
- [x] Schema deploys
- [x] Types generate

## Indexes

- [ ] teams by join code
- [ ] team members by team
- [ ] team members by user
- [ ] team member by team+user
- [ ] custom frameworks by team
- [ ] projects by team+status
- [ ] projects by team+updated time
- [ ] project members by project
- [ ] project member by project+user
- [ ] phases by project+order
- [ ] milestones by project+due date
- [ ] tasks by project
- [ ] tasks by project+owner
- [ ] tasks by project+status
- [ ] evidence by task
- [ ] reviews by task
- [ ] activity by project+timestamp
- [ ] snapshots by project

---

# 7. Team Creation and Realtime

## Create Team

- [ ] Team name required
- [ ] Unique short join code
- [ ] Creator becomes member
- [ ] Creator lands on team home
- [ ] Join code visible
- [ ] Join code copyable
- [ ] Activity logged

## Join Team

- [ ] Join input
- [ ] Code normalised
- [ ] Invalid code error
- [ ] Duplicate join blocked
- [ ] Membership stored
- [ ] User lands on team home
- [ ] Activity logged

## Permissions

- [ ] Non-member cannot read team
- [ ] Non-member cannot read projects
- [ ] Non-member cannot read evidence
- [ ] Non-member cannot edit framework
- [ ] Non-member mutation rejected

## Realtime Gate

- [ ] Separate Account A session
- [ ] Separate Account B session
- [ ] Both join same team
- [ ] Member appears within 1–2 seconds
- [ ] Shared test record updates live
- [ ] No refresh
- [ ] Uses `useQuery`
- [ ] Product work waits until gate passes

---

# 8. Character Customisation

## Selector

- [ ] Fill colour
- [ ] Outline colour
- [ ] Palette only
- [ ] Fill/outline cannot match
- [ ] Thick rounded outline
- [ ] Live preview
- [ ] Initials/name visible
- [ ] Optional spell type
- [ ] Keyboard accessible
- [ ] Mobile friendly

## Backend

- [ ] Stored per team member
- [ ] Membership checked
- [ ] Palette validated
- [ ] Arbitrary CSS rejected
- [ ] Matching colours rejected
- [ ] Change logged
- [ ] Teammates update live
- [ ] Refresh persists
- [ ] Different teams may use different colours

---

# 9. Built-in Frameworks

## Design and Creative

- [ ] Empathise
- [ ] Define / Research
- [ ] Ideate
- [ ] Prototype
- [ ] Test
- [ ] Refine
- [ ] Deliver
- [ ] Nonlinear overlap supported
- [ ] Testing loopback supported

## Marketing and Communications

- [ ] Situation and Audience Research
- [ ] Strategy and Objectives
- [ ] Concept Development
- [ ] Content Production
- [ ] Channel Planning
- [ ] Launch
- [ ] Measurement and Optimisation

## Business and Entrepreneurship

- [ ] Problem or Opportunity
- [ ] Market and Stakeholder Research
- [ ] Solution or Business Model
- [ ] Financial and Operational Planning
- [ ] Risk Assessment
- [ ] Implementation Proposal
- [ ] Evaluation and Presentation

## Architecture and Spatial Design

- [ ] Site and Context Analysis
- [ ] User and Programme Research
- [ ] Concept Development
- [ ] Schematic Design
- [ ] Design Development
- [ ] Technical Documentation
- [ ] Visualisation and Presentation
- [ ] Review and Revision
- [ ] Nonlinear revision supported

## Film, Animation, and Media Production

- [ ] Development
- [ ] Research and Script
- [ ] Pre-production
- [ ] Production
- [ ] Post-production
- [ ] Testing and Revision
- [ ] Distribution or Presentation
- [ ] Common dependencies included

## Software and IT

- [ ] Requirements
- [ ] Backlog and Planning
- [ ] UX / Technical Design
- [ ] Development
- [ ] Testing
- [ ] Deployment
- [ ] Review and Iteration
- [ ] Sprint support

## Academic Research

- [ ] Research Question
- [ ] Literature Review
- [ ] Methodology
- [ ] Ethics / Preparation
- [ ] Data Collection
- [ ] Analysis
- [ ] Discussion
- [ ] Writing
- [ ] Review and Submission

## Framework Quality

- [ ] Names and descriptions
- [ ] Discipline tags
- [ ] Suggested deliverables
- [ ] Suggested skills
- [ ] Default dependencies
- [ ] Overlap metadata
- [ ] Review checkpoints
- [ ] Versioned template data
- [ ] Preview UI
- [ ] Duplicate/edit option

---

# 10. Custom Framework

## Builder

- [ ] Name
- [ ] Description
- [ ] Add phase
- [ ] Rename phase
- [ ] Reorder phase
- [ ] Delete phase
- [ ] Optional phase
- [ ] Suggested deliverables
- [ ] Suggested skills
- [ ] Dependencies
- [ ] Overlap toggle
- [ ] Review checkpoint
- [ ] Duplicate preset
- [ ] Save
- [ ] Edit
- [ ] Delete with confirmation
- [ ] Reuse in future projects

## Backend

- [ ] Stored in Convex
- [ ] Team ownership enforced
- [ ] Creator stored
- [ ] Created/updated time
- [ ] Version stored
- [ ] Validation
- [ ] Non-member blocked
- [ ] Deleting used framework handled safely

## Test

- [ ] Create from blank
- [ ] Duplicate Design framework
- [ ] Edit phases
- [ ] Save
- [ ] Use in project
- [ ] Reopen
- [ ] Teammates see live
- [ ] Unauthorised edit rejected

---

# 11. Long-Running Projects

## Project Duration

- [ ] Projects may last months
- [ ] Start date
- [ ] Deadline
- [ ] Phase dates
- [ ] Milestone dates
- [ ] Task dates
- [ ] No hard two-week project limit
- [ ] Active data persists in Convex
- [ ] Cross-device return works

## Hierarchy

- [ ] Project
- [ ] Phase
- [ ] Milestone
- [ ] Task
- [ ] Optional subtask/checkpoint

## Two-Week Guidance

- [ ] Task may exceed 14 days
- [ ] Suggest breakdown
- [ ] User can ignore suggestion
- [ ] AI breakdown optional
- [ ] No validation rejection
- [ ] Message is supportive

## Scaling

- [ ] Project list paginated
- [ ] Task list paginated or virtualised
- [ ] Activity list paginated
- [ ] Active projects not auto-deleted
- [ ] Archived text remains
- [ ] Large assets use external links
- [ ] No video upload

---

# 12. Project Creation

## Consolidated Setup

- [ ] Project details
- [ ] Framework selection
- [ ] Member planning inputs
- [ ] Phase preview
- [ ] Milestone preview
- [ ] Task plan
- [ ] Allocation suggestions
- [ ] Final confirmation
- [ ] No rigid multi-page wizard
- [ ] Collapsible sections allowed

## Framework Selection

- [ ] Seven presets
- [ ] Custom
- [ ] Preview
- [ ] Manual choice
- [ ] AI recommendation
- [ ] Duplicate/edit before use

## Member Inputs

- [ ] Skills
- [ ] Availability
- [ ] Current workload
- [ ] Preferences
- [ ] Optional weekly capacity
- [ ] Inputs labelled self-reported

## Validation

- [ ] Title
- [ ] Dates
- [ ] Team membership
- [ ] At least one project member
- [ ] Valid framework
- [ ] Valid phases
- [ ] Valid milestones
- [ ] Valid owners
- [ ] Valid dependencies
- [ ] Backend repeats critical checks

## Creation Test

- [ ] Account A creates project
- [ ] Account B sees it live
- [ ] Framework copied correctly
- [ ] Phases created
- [ ] Milestones created
- [ ] Tasks created
- [ ] Planning inputs saved
- [ ] Refresh persists

---

# 13. Allocation Engine

## Deterministic Inputs

- [ ] Required skills
- [ ] Availability
- [ ] Current workload
- [ ] Preferences
- [ ] Dependency timing
- [ ] Estimated effort
- [ ] Weekly capacity

## Suggested Scoring

- [ ] Skill match 0–40
- [ ] Availability 0–25
- [ ] Workload balance 0–20
- [ ] Preference 0–10
- [ ] Dependency timing 0–5
- [ ] Hard constraints before score
- [ ] Configurable weights
- [ ] Consistent output

## Explainability

- [ ] Explanation per suggested owner
- [ ] No objective fairness claim
- [ ] Task count not fairness score
- [ ] Assumptions visible
- [ ] User can inspect inputs

## Human Control

- [ ] Swap owner
- [ ] Add collaborator
- [ ] Split task
- [ ] Merge task
- [ ] Edit effort
- [ ] Edit difficulty
- [ ] Edit dates
- [ ] Edit dependencies
- [ ] Reject AI plan
- [ ] Manual plan

## Tests

- [ ] Skill fit preferred
- [ ] Unavailable member avoided
- [ ] Overloaded member penalised
- [ ] Preference considered
- [ ] No-owner tasks flagged
- [ ] Explanation matches score
- [ ] Same inputs give stable result

---

# 14. Nonlinear Workflow

- [ ] Overlapping phases
- [ ] Task dependencies
- [ ] Loop back to earlier phase
- [ ] Revision cycles
- [ ] Blocked status
- [ ] Reopen completed task
- [ ] Reopen logged
- [ ] Dependency indicators
- [ ] No mandatory complex graph editor
- [ ] Clear list/board experience

---

# 15. Task Management

## Task Fields

- [ ] Title
- [ ] Description
- [ ] Phase
- [ ] Milestone
- [ ] Primary owner
- [ ] Collaborators
- [ ] Required skills
- [ ] Estimated effort
- [ ] Difficulty 1–5
- [ ] Weight
- [ ] Start date
- [ ] Due date
- [ ] Dependencies
- [ ] Review requirement
- [ ] Reviewer
- [ ] Source
- [ ] Status

## Actions

- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Assign
- [ ] Reassign
- [ ] Add collaborator
- [ ] Start
- [ ] Block
- [ ] Send to review
- [ ] Complete
- [ ] Reopen
- [ ] Search
- [ ] Filter by owner
- [ ] Filter by phase
- [ ] Filter by status

## Rules

- [ ] Team permission
- [ ] Project permission
- [ ] Valid owner
- [ ] Valid collaborator
- [ ] Valid reviewer
- [ ] No self-review
- [ ] Valid dependency
- [ ] Circular dependency handled
- [ ] Task count not effort
- [ ] Changes live
- [ ] Changes logged

## Long Task

- [ ] >14-day detection
- [ ] Breakdown suggestion
- [ ] Ignore option
- [ ] AI subtasks option
- [ ] No hard error

---

# 16. Evidence and Review

## Evidence Types

- [ ] Note
- [ ] External link
- [ ] Image
- [ ] PDF
- [ ] Figma link
- [ ] Drive link
- [ ] GitHub link
- [ ] Miro/other link

## Upload Rules

- [ ] PDF max 10 MB
- [ ] Image max 5 MB
- [ ] No video
- [ ] Storage ID saved
- [ ] Temporary URL not saved
- [ ] Upload progress
- [ ] Upload error
- [ ] File type validation
- [ ] Authorised URL generation

## Review

- [ ] Optional per task
- [ ] Reviewer assigned only when required
- [ ] No self-review
- [ ] Reviewer project member
- [ ] Pending
- [ ] Approved
- [ ] Changes requested
- [ ] Comment
- [ ] Review time
- [ ] Return to editable state
- [ ] Activity logged

## Contribution Report

- [ ] Owned tasks
- [ ] Collaborator tasks
- [ ] Effort/weight
- [ ] Status history
- [ ] Evidence summary
- [ ] Review outcome
- [ ] Dates
- [ ] Fairness limitation note

---

# 17. Progress and Game Layer

## Practical Progress

- [ ] Weighted required tasks
- [ ] Milestone completion
- [ ] Project status
- [ ] Progress source documented
- [ ] No manual client-only persistent progress

## Optional Boss Visual

- [ ] Project represented as boss
- [ ] Weighted progress reduces visual health
- [ ] Milestone animation
- [ ] Completion celebration
- [ ] Overdue “boss still standing”
- [ ] Game does not block actions
- [ ] Core data uses practical statuses

## Removed

- [ ] No separate goblin log
- [ ] No goblin quota
- [ ] No final-member-PDF HP
- [ ] No defeated/survived-only database state

---

# 18. Workload and At-Risk Support

## Workload View

- [ ] Tasks by member
- [ ] Estimated effort
- [ ] Due-date overlap
- [ ] Availability
- [ ] Capacity
- [ ] Phase workload
- [ ] No public ranking

## Risk Flags

- [ ] Overdue task
- [ ] Blocked dependency
- [ ] No owner
- [ ] Pending review
- [ ] Overloaded member
- [ ] Multiple heavy due tasks
- [ ] Milestone at risk

## Actions

- [ ] Reassign
- [ ] Add collaborator
- [ ] Split task
- [ ] Edit date
- [ ] Ask AI to rebalance
- [ ] Human confirmation
- [ ] No automatic AI monitoring

---

# 19. Activity and Notifications

## Logged Events

- [ ] Team created
- [ ] Member joined
- [ ] Character changed
- [ ] Framework created
- [ ] Framework edited
- [ ] Project created
- [ ] Phase changed
- [ ] Milestone changed
- [ ] Task created
- [ ] Task assigned
- [ ] Task reassigned
- [ ] Status changed
- [ ] Evidence submitted
- [ ] Review approved
- [ ] Changes requested
- [ ] Task reopened
- [ ] Project at risk
- [ ] Project completed
- [ ] Project archived
- [ ] Project deleted

## Behaviour

- [ ] UTC storage
- [ ] Local display
- [ ] Actor from auth
- [ ] Typed metadata
- [ ] Paginated
- [ ] Realtime
- [ ] In-app notification
- [ ] No false push notification claim

---

# 20. Sound System

## Core

- [ ] Central Web Audio manager
- [ ] Sound toggle
- [ ] Optional volume
- [ ] Preference persists
- [ ] User gesture unlock
- [ ] Graceful failure
- [ ] No copyrighted files required
- [ ] No sound on failed action
- [ ] No duplicate rerender sound
- [ ] Old events not replayed
- [ ] Remote events deduplicated

## Sounds

- [ ] Button pop
- [ ] Member joined sparkle
- [ ] Character saved twinkle
- [ ] Framework selected chime
- [ ] Project created flourish
- [ ] Task created rising pop
- [ ] Task assigned chime
- [ ] Task completed success pop
- [ ] Evidence submitted whoosh
- [ ] Review approved chord
- [ ] Changes requested neutral boop
- [ ] Milestone fanfare
- [ ] Project completion arpeggio
- [ ] Overdue subtle alert
- [ ] AI ready sparkle

---

# 21. AI-Assisted Planning

## Provider

- [ ] Convex server action
- [ ] No direct React request
- [ ] Key private
- [ ] Model configurable
- [ ] Default Gemma model
- [ ] Fallback free router
- [ ] No key in `VITE_`
- [ ] No key committed

## Input

- [ ] Brief text
- [ ] Candidate framework
- [ ] Deadline
- [ ] Members
- [ ] Skills
- [ ] Availability
- [ ] Workload
- [ ] Preferences
- [ ] Length limit
- [ ] Explicit trigger

## Output

- [ ] Recommended framework
- [ ] Reason
- [ ] Phases
- [ ] Milestones
- [ ] Tasks
- [ ] Dependencies
- [ ] Skills
- [ ] Effort
- [ ] Difficulty
- [ ] Owners
- [ ] Collaborators
- [ ] Explanations
- [ ] Review requirements
- [ ] Long-task breakdown
- [ ] Risks
- [ ] Assumptions
- [ ] Strict validation
- [ ] Prefill only
- [ ] Editable
- [ ] Confirmation required

## Failure

- [ ] Timeout
- [ ] Rate limit
- [ ] Model unavailable
- [ ] Invalid JSON
- [ ] Empty response
- [ ] Retry
- [ ] Manual fallback

---

# 22. Main Pages

## Public

- [ ] Landing
- [ ] Product explanation
- [ ] Logo
- [x] Google sign-in
- [ ] Theme toggle
- [ ] Responsive navigation

## Authenticated

- [ ] Profile/onboarding
- [ ] Create/join team
- [ ] Team home
- [ ] Project list
- [ ] Archived projects
- [ ] Character settings
- [ ] Framework library
- [ ] Custom framework builder
- [ ] Create project
- [ ] Project workspace
- [ ] Team settings

## Project Tabs

- [ ] Overview
- [ ] Plan
- [ ] Tasks
- [ ] Workload
- [ ] Evidence
- [ ] Activity
- [ ] Report
- [ ] Mobile navigation

---

# 23. Archive, Export, and Deletion

## Archive

- [ ] Complete project
- [ ] Archive project
- [ ] Paginated archive
- [ ] Reopen/view archive
- [ ] No two-project cap
- [ ] Active project never auto-deleted
- [ ] Text history retained

## Export

- [ ] Branded PDF
- [ ] Logo in PDF
- [ ] Framework
- [ ] Dates
- [ ] Phases
- [ ] Milestones
- [ ] Tasks
- [ ] Owners
- [ ] Collaborators
- [ ] Effort/weight
- [ ] Evidence summary
- [ ] Reviews
- [ ] Activity
- [ ] Contribution summary
- [ ] Multi-page
- [ ] Long text wrap
- [ ] Mobile download
- [ ] Optional JSON export

## Delete

- [ ] Explicit confirmation
- [ ] Authorisation
- [ ] Export reminder
- [ ] Related files deleted
- [ ] Idempotent
- [ ] Failure logged
- [ ] No hidden auto-delete

---

# 24. Responsive and Accessibility

## Responsive

- [ ] 320 px supported
- [ ] Mobile-first
- [ ] Desktop grids
- [ ] No horizontal overflow
- [ ] Touch targets
- [ ] Mobile colour selector
- [ ] Mobile framework builder
- [ ] Mobile project form
- [ ] Mobile task board
- [ ] Mobile upload
- [ ] Mobile PDF

## Accessibility

- [ ] Visible labels
- [ ] Keyboard navigation
- [ ] Visible focus
- [ ] Error announcements
- [ ] Loading announcements
- [ ] Colour-independent status
- [ ] Contrast
- [ ] SVG labels
- [ ] Dialog focus
- [ ] Reduced motion
- [ ] Accessible theme toggle
- [ ] Accessible sound toggle
- [ ] Accessible character selector
- [ ] Accessible framework selector
- [ ] Accessible file input

---

# 25. Security and Privacy

- [ ] Actor derived from auth
- [ ] Team membership enforced
- [ ] Project membership enforced
- [ ] Framework ownership enforced
- [ ] Owner validated
- [ ] Collaborator validated
- [ ] Reviewer validated
- [ ] No self-review
- [ ] Palette validated
- [ ] Dependencies validated
- [ ] File type validated
- [ ] File size validated
- [ ] File URL authorised
- [ ] Duplicate join prevented
- [ ] Project delete authorised
- [ ] Frontend actor ID not trusted
- [ ] AI guarded
- [ ] Secrets server-side
- [ ] Basic Google identity only
- [ ] Evidence visibility explained
- [ ] No surveillance language

---

# 26. Errors and Edge Cases

- [ ] Missing Convex URL
- [ ] Convex disconnected
- [ ] OAuth cancelled
- [ ] Redirect mismatch
- [ ] Expired session
- [ ] Missing profile
- [ ] Invalid join code
- [ ] Duplicate join
- [ ] Missing team
- [ ] Missing project
- [ ] Non-member
- [ ] Deleted framework
- [ ] Invalid custom framework
- [ ] Empty plan
- [ ] No owner
- [ ] Invalid collaborator
- [ ] Invalid reviewer
- [ ] Self-review
- [ ] Invalid dependency
- [ ] Circular dependency
- [ ] >14-day task
- [ ] Date outside project
- [ ] Upload failure
- [ ] Wrong file type
- [ ] Oversized file
- [ ] Duplicate evidence
- [ ] Review after deletion
- [ ] AI timeout
- [ ] AI rate limit
- [ ] AI unavailable
- [ ] Invalid AI JSON
- [ ] Offline
- [ ] Reconnect
- [ ] Audio unavailable
- [ ] Logo failure

---

# 27. Testing

## Backend

- [ ] Auth helpers
- [ ] Profile idempotency
- [ ] Join code uniqueness
- [ ] Duplicate membership
- [ ] Team authorisation
- [ ] Project authorisation
- [ ] Palette validation
- [ ] Custom framework ownership
- [ ] Phase ordering
- [ ] Dependency validation
- [ ] Circular dependency
- [ ] Owner validation
- [ ] Collaborator validation
- [ ] Reviewer validation
- [ ] No self-review
- [ ] Evidence access
- [ ] Archive/delete permission
- [ ] Storage cleanup
- [ ] Allocation score
- [ ] AI schema validation

## Realtime Two-Session

- [ ] Member join
- [ ] Character update
- [ ] Framework creation
- [ ] Project creation
- [ ] Task creation
- [ ] Assignment
- [ ] Status
- [ ] Evidence
- [ ] Review
- [ ] Workload
- [ ] Completion
- [ ] Archive

## UI

- [ ] Logo
- [ ] Light mode
- [ ] Dark mode
- [ ] Theme persistence
- [ ] Sound
- [ ] Sound persistence
- [ ] Character
- [ ] Seven frameworks
- [ ] Custom framework
- [ ] Months-long project
- [ ] >14-day task suggestion
- [ ] Mobile
- [ ] Keyboard
- [ ] Reduced motion
- [ ] PDF
- [ ] AI fallback

## Build

- [ ] Install
- [x] Convex generation
- [x] Type check
- [x] Lint
- [x] Tests
- [x] Production build
- [x] No known console errors

---

# 28. Production Deployment

## Convex

- [ ] Production deployment exists
- [ ] Schema deployed
- [ ] Functions deployed
- [ ] Auth variables set
- [ ] OpenRouter variables set
- [ ] Development/production separated

## Google OAuth

- [ ] Production origin
- [ ] Production callback
- [ ] Test user or publishing status appropriate
- [ ] Production login tested

## Vercel

- [ ] Existing repository connected
- [ ] Correct root
- [ ] Correct build command
- [ ] `CONVEX_DEPLOY_KEY` private
- [ ] Production uses production Convex
- [ ] Deployment succeeds
- [ ] Route refresh works

## Production Test

- [ ] Login
- [ ] Team
- [ ] Realtime
- [ ] Character
- [ ] Framework
- [ ] Custom framework
- [ ] Long project
- [ ] Task
- [ ] Evidence
- [ ] Review
- [ ] Workload
- [ ] Archive
- [ ] PDF
- [ ] Theme
- [ ] Sound
- [ ] AI/manual fallback

---

# 29. Explicitly Out of Scope

- [ ] No payments
- [ ] No public leaderboard
- [ ] No punitive XP
- [ ] No separate goblin log
- [ ] No goblin quota
- [ ] No compulsory final PDF per member
- [ ] No self-review
- [ ] No universal reviewer per member
- [ ] Project history has no two-project cap
- [ ] No recurring AI monitoring
- [ ] No Gmail inbox access
- [ ] No video upload
- [ ] No unlicensed font downloads
- [ ] No unlicensed sound downloads
- [ ] No false online-presence claim

---

# 30. Development Progress Board

| Phase | Feature | Status | Blocker | Last tested |
|---|---|---|---|---|
| 0 | Clean repository bootstrap | Completed |  | 2026-07-30 |
| 1 | Convex connection | Completed |  | 2026-07-30 |
| 2 | Branding and theme | Not started |  |  |
| 3 | Google authentication | Completed |  | 2026-07-31 |
| 4 | Data architecture | Not started |  |  |
| 5 | Team realtime | Not started |  |  |
| 6 | Character customisation | Not started |  |  |
| 7 | Built-in frameworks | Not started |  |  |
| 8 | Custom framework | Not started |  |  |
| 9 | Long project structure | Not started |  |  |
| 10 | Project creation | Not started |  |  |
| 11 | Allocation engine | Not started |  |  |
| 12 | Nonlinear workflow | Not started |  |  |
| 13 | Task management | Not started |  |  |
| 14 | Evidence and review | Not started |  |  |
| 15 | Progress/game layer | Not started |  |  |
| 16 | Workload and risk | Not started |  |  |
| 17 | Activity | Not started |  |  |
| 18 | Sound | Not started |  |  |
| 19 | AI | Optional |  |  |
| 20 | Archive/export | Not started |  |  |
| 21 | Accessibility | Not started |  |  |
| 22 | Security | Not started |  |  |
| 23 | Testing | Not started |  |  |
| 24 | Production | Not started |  |  |

---

# 31. Current Sprint Notes

## Current phase

- [x] Phase: 3 — Google authentication

## Goal

- [x] Goal: Verify Google sign-in, profile idempotency, session refresh, sign-out, and signed-out backend rejection.

## Blockers

- [x] Blocker 1 resolved: Google Cloud OAuth web client ID and secret are stored privately in Convex.
- [ ] Blocker 2:
- [ ] Blocker 3:

## Codex result

- Files changed: Google-only auth provider, HTTP routes, auth configuration, auth/profile schema, protected helpers, profile functions, signed-out/loading/authenticated UI, sign-in/sign-out controls, docs and environment templates.
- Packages: `@convex-dev/auth@0.0.94`, patched `@auth/core@0.41.3`, and Node development types.
- Schema/index changes: Convex Auth tables plus `userProfiles`; indexes `by_auth_user_id` and `by_email`.
- Security checks: JWT keys stored only in Convex, Google secret server-side, patched Auth.js, signed-out query and mutation rejection.
- Commands: Convex Auth initializer, Convex deployment, function metadata, signed-out function checks, typecheck, lint, tests, build, production dependency audit.
- Tests passed: auth/schema deployment, function metadata, two-account Google sign-in, first-profile creation, returning-profile reuse, refresh persistence, sign-out, signed-out query rejection, signed-out mutation rejection, profile uniqueness, typecheck, lint, 5 tests, production build, and zero production dependency vulnerabilities.
- Tests failed: none in the mandatory local authentication gate.
- Manual actions completed: Google OAuth web client configured, local origin and exact Convex callback registered, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` stored privately, and two Google accounts tested.
- Remaining issue: OAuth-cancel handling remains an edge-case test; production OAuth and deployment remain intentionally pending.

## Next action

- [x] Review code
- [x] Test manually
- [x] Update checklist
- [x] Commit working state
- [x] Continue only after gate passes
