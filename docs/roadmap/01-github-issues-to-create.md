# Initial GitHub Issues to Create

Use these as the first GitHub issues.

## Issue 1: Finalise MVP feature list

### Objective

Agree the first version of SIGNAL that should actually be built.

### Acceptance criteria

- MVP features grouped by module
- Deferred features listed separately
- Non-goals documented
- Build sequence agreed

## Issue 2: Define internal data model

### Objective

Create the first TypeScript version of the core SIGNAL entities.

### Acceptance criteria

- DailyMetric model defined
- DailyCheckIn model defined
- WorkoutSession model defined
- WorkoutExercise model defined
- SupplementLog model defined
- Baseline model defined
- ReadinessScore model defined
- Insight model defined

## Issue 3: Build readiness score v0

### Objective

Create the first deterministic readiness score.

### Acceptance criteria

- Score outputs 0 to 100
- Status outputs green, amber or red
- Missing data handled
- Confidence shown
- Top drivers returned
- Recommendation generated

## Issue 4: Build daily check-in flow

### Objective

Allow the user to manually record subjective state.

### Acceptance criteria

- Mood field
- Energy field
- Stress field
- Motivation field
- Soreness field
- Injury flag
- Illness flag
- Notes field
- Stored against date

## Issue 5: Build workout logging v0

### Objective

Allow the user to log gym workouts.

### Acceptance criteria

- Add workout session
- Add exercises
- Record sets, reps, load and RPE
- Add pain flag
- Calculate estimated session load

## Issue 6: Build insight explanation format

### Objective

Ensure every recommendation is explainable.

### Acceptance criteria

- Insight title
- Plain English explanation
- Data used
- Rule triggered
- Confidence level
- Recommended action

## Issue 7: Create PWA shell

### Objective

Create the basic mobile-first app shell.

### Acceptance criteria

- React app created
- Mobile-first layout
- PWA-ready structure
- Dark clinical design tokens
- Initial navigation
- Placeholder dashboard

## Issue 8: Decide Fitbit and Google Health integration approach

### Objective

Confirm technical route for automated data.

### Acceptance criteria

- Fitbit OAuth requirements documented
- Google Health / Health Connect feasibility documented
- Nutrition availability confirmed or rejected
- First integration order agreed
