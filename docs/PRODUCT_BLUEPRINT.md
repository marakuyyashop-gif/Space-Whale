# Space Whale — Product Blueprint v1

Status: draft for approval  
Purpose: define the product before further implementation. No feature should be added unless it belongs to this blueprint or is explicitly approved as a later extension.

## 1. Product idea

Space Whale is a subscription platform for independent English teachers.

The platform owner:

- owns and publishes the Space Whale curriculum;
- manages teacher subscriptions;
- can also use the platform as a teacher without buying a subscription from herself;
- controls platform-wide settings, content and future pricing.

A subscribing teacher:

- receives a private teaching workspace;
- invites and manages their own students;
- uses the Space Whale A1, A2 and B1 lesson library;
- may create personal lessons using the same fixed templates;
- schedules and conducts lessons inside Space Whale;
- assigns homework and tracks student progress.

A student:

- belongs to a teacher workspace;
- sees only their own schedule, lessons, homework, notebook and progress;
- joins a live lesson through the platform;
- selects a prepared Space Whale character avatar instead of uploading a personal photo.

Teacher subscription billing and optional student-to-teacher payments are separate systems. Teacher subscription billing is part of the commercial platform. Student payments are optional and not required for the first working release.

## 2. The three product environments

### Environment A — Public website

Purpose: explain and sell Space Whale to teachers.

Primary navigation:

- Home
- Features
- Curriculum
- How It Works
- Pricing
- FAQ
- Sign In
- Start Trial / Subscribe

Required page sections:

- clear product promise;
- live-classroom demonstration;
- A1, A2 and B1 curriculum overview;
- what a teacher receives;
- teacher and student workflow;
- included lesson formats;
- subscription plans;
- FAQ;
- contact/support;
- legal pages: Terms, Privacy and subscription conditions.

The public website must not open a test lesson. Its main conversion is teacher registration or sign-in.

Later additions:

- testimonials;
- demo lesson;
- blog/resources;
- affiliate or referral programme;
- school/team plans.

### Environment B — Personal accounts

There is one account system with role-aware interfaces.

#### Platform owner/admin

Navigation:

- Overview
- Teachers
- Subscriptions
- Curriculum
- Content Publishing
- Platform Analytics
- Support
- Platform Settings

Special rules:

- owner access does not require a paid subscription;
- owner may also enter a normal teacher workspace;
- owner controls the global library and template versions;
- owner can suspend or restore teacher access without affecting curriculum source files.

#### Teacher account

Primary navigation:

- Home
- Schedule
- Students
- Library
- Homework
- Subscription
- Settings

Home:

- next lesson;
- today’s schedule;
- lessons awaiting homework review;
- students requiring attention;
- quick actions: Schedule lesson, Open library, Invite student.

Schedule:

- day/week calendar;
- one-time and recurring lessons;
- assigned student;
- attached library lesson;
- lesson status;
- join/open button;
- cancellation and rescheduling;
- reminders.

Students:

- student list and search;
- invite link;
- student profile;
- current level and current Part;
- lesson history;
- remaining lesson balance when the teacher uses package accounting;
- progress;
- homework;
- private teacher notes.

Library:

- Space Whale Library;
- My Lessons;
- favourites/recent lessons;
- filters by level, Part, topic, grammar and skill;
- lesson preview;
- assign to student;
- schedule with student;
- duplicate a global lesson into My Lessons only when personal editing is needed.

Homework:

- assigned;
- submitted;
- needs review;
- completed;
- automatic checking result where supported;
- teacher comments and manual override.

Subscription:

- current teacher plan;
- renewal date;
- limits and usage;
- billing history;
- payment method;
- cancel/reactivate.

Settings:

- teacher display name;
- prepared Space Whale avatar;
- practice/school name;
- timezone;
- notification preferences;
- classroom device test.

#### Student account

Primary navigation:

- Home
- Lessons
- Homework
- Notebook
- Progress
- Profile

Home:

- next lesson and countdown;
- Join button appears at the configured time, initially five minutes before the lesson;
- current homework;
- latest saved language;
- progress summary.

Lessons:

- upcoming lessons;
- completed lesson history;
- lesson summaries;
- attached materials that the teacher allows the student to revisit.

Homework:

- pending;
- submitted;
- automatically checked;
- teacher-reviewed;
- corrections and feedback.

Notebook:

- saved vocabulary;
- grammar rules;
- lesson cards;
- teacher/student notes;
- future dictionary favourites.

Progress:

- levels and Parts;
- completed lessons;
- completed activities;
- target language covered;
- homework completion;
- teacher comments.

Profile:

- display name;
- prepared Space Whale avatar selection;
- timezone;
- camera/microphone device test;
- notification settings.

## 3. Environment C — Lesson Space

Lesson lifecycle:

1. Teacher selects a library lesson.
2. Teacher attaches it to a student and a calendar session.
3. Join becomes available approximately five minutes before the scheduled time.
4. Teacher and student enter the waiting room.
5. Teacher starts the lesson.
6. Both users enter the same live classroom state.
7. Teacher finishes the lesson.
8. Space Whale saves the session summary, progress, language items and assigned homework.

### Waiting room

Required:

- lesson title and scheduled time;
- teacher/student presence;
- camera and microphone preview;
- device selection and permission errors;
- student waits until the teacher starts;
- teacher Start Lesson button;
- reconnect handling.

### Live classroom layout

The existing approved reference layout remains the visual foundation.

Persistent areas:

- lesson side menu;
- main activity workspace;
- teacher and student video;
- microphone and camera controls;
- connection status;
- lesson progress;
- leave/finish controls.

Side-menu tabs:

- Lesson — course outline and current activity;
- Language — vocabulary, constructions, rules and cards saved from the lesson;
- Practice — independent practice and homework connected to the lesson.

### Live synchronization

Required behaviour:

- teacher changes the activity and the student changes immediately;
- student input appears for the teacher character by character;
- student selections, matches and ordering changes are visible live;
- final submission remains a separate action;
- both sides see submission/checking state;
- connection loss does not erase the current answer;
- reconnect restores the latest lesson state;
- teacher can lead/lock the current view when necessary;
- completed activities and lesson progress are stored per student.

Target: sub-second UI synchronization under normal network conditions. Exact zero-delay delivery cannot be guaranteed over the public internet, so the system must show connection state and recover cleanly.

### Audio synchronization

Required:

- teacher starts, pauses or seeks lesson audio;
- the same action is sent to the student;
- both clients report playback state;
- drift is detected and corrected;
- browser autoplay restrictions are handled through an initial student interaction.

### Video and voice

The current local camera preview is not sufficient.

Production requirement:

- teacher sees the student;
- student sees the teacher;
- microphone mute/unmute;
- camera on/off;
- device selection;
- connection quality indicator;
- reconnect after network interruption.

For reliable production use, video should use a WebRTC service or managed infrastructure with TURN support rather than only local media preview.

### Dictionary interaction — later phase

- click or tap a word;
- show a short level-appropriate definition;
- pronunciation;
- example;
- save to Notebook;
- optional translation;
- licensed dictionary source or approved API with caching.

## 4. Curriculum and content model

Visible hierarchy:

- Level: A1, A2, B1
- Part
- Lesson
- Activity

Internal content entities:

- course;
- level;
- part;
- lesson;
- activity;
- asset;
- template version;
- publication version.

Each lesson stores:

- title;
- level;
- Part;
- topic;
- grammar;
- words;
- lexical constructions;
- learning goals;
- approximate duration;
- ordered activities;
- homework;
- teacher notes;
- student-visible summary;
- version and publication status.

A lesson must be data, not a separate hand-written HTML page.

## 5. Fixed lesson-template system

The long-term goal is to add lessons without redesigning or recoding the interface.

### Design system

One locked system controls:

- typography;
- spacing;
- card dimensions;
- colours;
- borders;
- corner radius;
- shadows;
- exercise icons;
- states: default, hover, selected, correct, retry, completed, disabled;
- desktop/tablet/mobile behaviour.

An individual lesson may provide content and approved assets, but may not redefine layout.

### Activity registry

Each exercise type has:

- one canonical component;
- one content schema;
- one Source specification;
- one icon;
- one interaction model;
- one checking model;
- one saved-state model;
- one responsive layout;
- one accessibility contract.

Initial registry:

- WORD–PIC
- WORD–DEFINITION
- LISTEN & REPEAT
- GRAMMAR / LANGUAGE RULE
- ЗАЙКА
- ЛИСИЧКА
- МЕДВЕДЬ
- SPEAKING TASK
- CORRECT THE MISTAKES
- WHICH SENTENCES ARE CORRECT?
- UNSCRAMBLE
- PARAPHRASE
- MATCH THE PARTS
- MATCH PHRASE → SITUATION
- PICTURE–WRITE
- DISCOVER THE RULE
- DISCUSSION QUESTIONS
- LISTEN AND CHOOSE

The Source files are mandatory specifications, not visual suggestions. The relevant Source and linked master references must be read before generating an activity, and the finished activity must be checked against them.

### Lesson production pipeline

1. User provides level, topic, grammar, words, constructions and goals.
2. Space Whale/assistant first produces a timed lesson outline.
3. User approves the outline.
4. Activities are generated one by one using their exact Source specifications.
5. Content is validated against the activity schema and level.
6. The lesson is rendered using locked components.
7. Desktop and mobile preview are checked.
8. The lesson is saved as Draft.
9. Owner publishes a version.
10. Published lessons become available in the global library.

This follows the approved Lesson Builder method: approximately 60 minutes, 5–7 minutes reserved for small talk, a minimal non-duplicative sequence, and a final communicative task.

### Validation before publication

Automated validation should check:

- required fields;
- allowed activity type;
- target level;
- unique correct answers where required;
- shuffled word banks where required;
- answer/checking data;
- missing assets;
- unapproved fonts, colours or dimensions;
- activity duration and total lesson duration;
- broken audio/image references;
- mobile overflow;
- Source-specific rules.

## 6. Core data boundaries

Space Whale must be multi-tenant from the foundation.

Global platform data:

- curriculum;
- global lesson library;
- exercise templates;
- avatar catalogue;
- public pricing plans.

Teacher workspace data:

- teacher profile;
- private students;
- personal lessons;
- schedule;
- notes;
- homework;
- optional student payment records;
- notification settings.

Student data:

- assigned teacher/workspace;
- schedule;
- answers;
- progress;
- homework;
- Notebook;
- avatar;
- optional lesson balance.

Live-session data:

- participants;
- current activity;
- shared state;
- live drafts;
- submitted responses;
- audio state;
- attendance;
- start/end times;
- connection events.

A teacher must never be able to read another teacher’s students, schedules, notes or personal lessons.

## 7. Payments and lesson accounting

### Teacher subscription — commercial requirement

- plan;
- trial;
- active/past-due/cancelled status;
- subscription start and renewal;
- entitlement to platform features;
- owner/admin bypass;
- billing history.

Implementation is not part of the first foundation milestone, but the role and entitlement model must reserve it now.

### Student payments — optional later module

Possible teacher setting:

- disabled;
- manual lesson balance only;
- payment links;
- integrated student checkout.

Student payment records belong to the teacher workspace and are separate from the teacher’s Space Whale subscription.

### Lesson balance

Optional per student:

- purchased/added lessons;
- reserved lesson;
- completed lesson;
- cancelled/returned lesson;
- remaining balance;
- audit history.

Recommended rule: reserve a lesson when scheduled, deduct it when completed, and return it after an eligible cancellation. The exact cancellation policy remains a business setting.

## 8. Missing but necessary platform functions

These are standard foundation functions that were not all mentioned explicitly:

- email verification and password reset;
- role and subscription access checks;
- empty, loading and error states;
- timezone-safe scheduling;
- recurring lessons;
- cancellations and rescheduling;
- reminder notifications;
- attendance;
- activity and lesson versioning;
- autosave and reconnect recovery;
- support/contact channel;
- privacy, consent and data deletion;
- audit trail for payments and lesson balances;
- backups and migration history;
- accessibility and keyboard interaction;
- responsive layouts;
- monitoring and error logging.

## 9. Delivery phases

### Phase 0 — Blueprint approval

- approve roles;
- approve navigation;
- approve core flows;
- approve feature priorities;
- stop building unapproved branches.

### Phase 1 — Foundation and shared shell

- stable routing for public site, accounts and classroom;
- role-aware access;
- platform owner role;
- teacher/student workspace separation;
- shared design tokens and reusable shell;
- database migrations and server functions stored in GitHub;
- remove dead navigation and accidental features.

The existing PR that separates the root entry from the classroom belongs to this phase and remains compatible with this blueprint.

### Phase 2 — Account skeletons

- public website skeleton;
- teacher navigation and empty pages;
- student navigation and empty pages;
- prepared avatar catalogue;
- profile/settings;
- consistent loading, empty and error states.

### Phase 3 — Content engine

- canonical lesson data schema;
- activity component registry;
- Source-driven lesson import;
- global Library and My Lessons;
- lesson preview;
- draft/publish/version flow;
- first complete reference lesson rendered from data.

### Phase 4 — Students and scheduling

- invitations;
- student profiles;
- level and current Part;
- calendar;
- recurring lessons;
- reminders;
- session creation;
- five-minute Join rule;
- waiting room.

### Phase 5 — Live classroom state

- teacher-led activity navigation;
- live student typing and choices;
- submission/checking;
- autosave;
- reconnect recovery;
- synchronized lesson audio;
- completion state.

### Phase 6 — Real video/audio

- two-way WebRTC;
- microphone/camera controls;
- device selection;
- connection quality and recovery.

### Phase 7 — Learning records

- lesson history;
- per-student progress;
- saved Language content;
- Notebook;
- homework assignment/submission/review;
- automatic checking for supported activity types;
- lesson balance ledger.

### Phase 8 — Commercial billing

- teacher trials and subscriptions;
- owner bypass;
- entitlement enforcement;
- billing portal and history;
- optional student payments after the core model is stable.

### Phase 9 — Enhancements

- click-to-open dictionary;
- AI-assisted homework checking;
- lesson recording;
- messaging;
- analytics;
- teams/schools;
- mobile apps.

## 10. First release boundary

The first usable private beta is complete when:

- owner can publish a lesson from fixed templates;
- a teacher can register, invite a student and select an avatar;
- teacher can find a global lesson and schedule it;
- student sees the lesson and receives Join access at the correct time;
- both enter the waiting room and teacher starts the class;
- teacher controls the current activity;
- student work is visible live and saved;
- lesson completion updates history and progress;
- teacher can assign homework;
- all pages use one coherent Space Whale design;
- no navigation item is a dead placeholder.

Teacher billing, student checkout, dictionary and AI checking may remain disabled in the private beta, but their future data boundaries must not require rebuilding the core.
