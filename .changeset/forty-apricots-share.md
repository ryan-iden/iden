---
"@logto/experience": patch
---

fix profile completion and repeated Alibaba Cloud CAPTCHA verification during sign-in and registration

Profile completion can send verification codes without starting another CAPTCHA challenge. Failed challenges show a localized message, and navigating between forms or retrying verification no longer reuses an expired challenge.
