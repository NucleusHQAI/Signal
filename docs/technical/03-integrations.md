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

Expected value:

- Aggregated health records depending on device/app sync
- Potential route for nutrition if supported by source apps
- Possible bridge for Fitbit data depending on user setup

Risks:

- Availability differs across Android, web and platform context.
- Not all app data is necessarily readable by third-party apps.
- Nutrition coverage may be inconsistent.

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
4. Fitbit OAuth and core wearable metrics
5. Google Health / Health Connect
6. Nutrition only once data availability is proven
