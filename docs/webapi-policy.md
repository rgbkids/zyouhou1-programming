# WebAPI Policy

- `webapi.get_json(name, params...)` only supports allowlisted endpoints.
- Current allowlist: `zip`, `weather`.
- Unknown endpoints fail immediately instead of reaching arbitrary URLs.
- Responses are local mock data shaped for classroom readability.
- This repository intentionally avoids unrestricted browser fetch from student code.
