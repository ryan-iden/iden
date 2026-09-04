---
"@logto/account": patch
"@logto/core": patch
"@logto/schemas": patch
"@logto/phrases-experience": patch
---

fix organization member names, localized labels, and business role editor layout

Organization members now display their username consistently. Management permissions, built-in roles, invitations, and activity labels are localized across all supported languages. The business role editor expands below the member summary without stretching the row or hiding member details.

OpenAPI documents remain available when self-hosted organization management is disabled, without leaking unavailable tags or schemas.
