# JWT Keys

Development RSA keys live in this directory. The private and public keys are ignored by Git to prevent accidental commits.

Generate new keys with:

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in private.pem -out public.pem
```

Update `.env.local` / `.env` references after regeneration.
