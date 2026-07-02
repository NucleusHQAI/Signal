# SIGNAL Integrations

## Integration strategy

External APIs should feed SIGNAL, not define SIGNAL.

Each integration should be treated as an adapter that maps source-specific data into the internal SIGNAL data model.

## Priority integrations

### Fitbit

Expected value:

- Sleep
- Resting heart rate
- Activity
- Steps
- Exercise sessions
- Potentially HRV, depending on availability and permissions

Risks:

- API availability and permissions may vary.
- Some metrics may be delayed, incomplete or not exposed in the way expected.
- OAuth setup and refresh token handling must be implemented properly.

### Google Health / Health Connect

As of mid-2026, "Google Health" covers two different things worth distinguishing:

- **Health Connect**: an on-device Android API with no cloud/REST access - only usable from a native Android app, not from SIGNAL's PWA.
- **Google Health API** (`developers.google.com/health`): the unified server-to-server OAuth 2.0 API that replaced the legacy Fitbit Web API (which turns down September 2026). This is what SIGNAL actually integrates against - see `docs/technical/05-google-health-setup.md` - and it covers Fitbit and Pixel Watch data on one API, so it replaces the separate "Fitbit OAuth" line item below rather than sitting alongside it.

Expected value:

- Sleep, resting heart rate, HRV, steps, activity minutes from Fitbit / Pixel Watch
- Potential route for nutrition if supported by source apps

Risks:

- Data type / field naming needs verifying against the live API reference (some of it was inaccessible while this was documented - see the "verify" note in `docs/technical/05-google-health-setup.md`).
- Not all app data is necessarily readable by third-party apps.
- Nutrition coverage may be inconsistent.
- Sensitive-scope Google verification/CASA review is required before this can serve real users beyond a handful of manually added test users.

### Manual input

Manual input is not a fallback of last resort. It is a core feature.

SIGNAL needs manual data because wearables do not fully capture:

- Mood
- Motivation
- Soreness
- Injury
- Illness
- Supplements
- Context
- Perceived recovery
- Training intent

## Integration design pattern

```text
Source API response
  -> source adapter
  -> normalised SIGNAL entity
  -> validation
  -> storage
  -> rules engine
  -> dashboard / insights
```

## Data quality checks

Each imported metric should track:

- Source
- Timestamp
- Date represented
- Completeness
- Confidence
- Whether the value was automated, estimated or manual

## MVP recommendation

Do not start by integrating every source.

Recommended order:

1. Manual daily check-in
2. Manual gym workout logging
3. Local demo data
4. Google Health API OAuth and core wearable metrics (covers Fitbit + Pixel Watch on one integration)
5. Nutrition only once data availability is proven
