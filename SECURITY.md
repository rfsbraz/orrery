# Security policy

## Supported versions

Orrery is pre-1.0 and ships from `main`. Only the currently deployed version is
supported; there are no maintained release branches yet.

| Version | Supported |
|---|---|
| `main` (deployed) | yes |
| anything older | no |

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Use [GitHub Security Advisories](https://github.com com/rfsbraz/orrery/security/advisories/new)
to report privately. If that is unavailable to you, email rfsbraz@gmail.com with
"orrery security" in the subject.

Expect a first response within 7 days. If the report is valid you will be kept
updated until it is fixed, and credited in the advisory unless you would rather
not be.

## What is in scope

The app reads its canon from a git submodule at build time and stores user data
in Supabase. Things worth reporting:

- **Row Level Security gaps.** The Supabase anon key is public by design, so RLS
  is the entire boundary between one reader's data and another's. A policy that
  lets a user read or write rows that are not theirs is the highest-severity
  class of bug in this project.
- Authentication or session handling flaws.
- Anything that lets a reading order or profile be modified by someone
  who does not own it, or moderated by someone who is not a moderator.
- Injection or SSRF in the build or content pipeline.

## What is not in scope

- The content itself being wrong. That is a curation issue, not a security one:
  open a normal issue on
  [orrery-content](https://github.com/rfsbraz/orrery-content).
- Missing security headers with no demonstrated impact.
- Rate limiting on endpoints that only serve public canon.
- Anything requiring physical access to the self-hosted deployment.
