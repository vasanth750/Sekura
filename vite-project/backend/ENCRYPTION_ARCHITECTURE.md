# Sekura Encryption Architecture

## Folder Structure

```text
backend/
  models/
    EncryptedSecret.js
  routes/
    encryptedSecrets.js
  utils/
    encryption.js
  middleware/
    auth.js
  user.js
  server.js
```

## DEK and MEK

The DEK, or Data Encryption Key, encrypts one sensitive record such as a note, secret, message, or file payload. Sekura generates a fresh random 32-byte DEK for every encrypted document.

The MEK, or Master Encryption Key, protects DEKs. It comes from `MEK_BASE64` in the backend environment and is never stored in MongoDB. MongoDB stores only encrypted data and encrypted DEKs.

The MEK should not directly encrypt large user data because rotating it would require decrypting and re-encrypting every protected field. With envelope encryption, key rotation can rewrap encrypted DEKs while leaving large ciphertexts unchanged.

## Write Flow

1. User calls a protected API with a JWT.
2. Backend generates a random DEK.
3. Backend encrypts user data with AES-256-GCM using the DEK.
4. Backend encrypts the DEK with AES-256-GCM using the MEK.
5. MongoDB stores encrypted data, encrypted DEK, IVs, auth tags, algorithm metadata, owner, and timestamps.
6. Plaintext and decrypted keys are not returned except when a protected decrypt API explicitly needs plaintext.

## Read Flow

1. User calls a protected decrypt API with a JWT.
2. Backend fetches only records owned by `req.user.id`.
3. Backend decrypts the encrypted DEK using the MEK.
4. Backend decrypts encrypted data using the decrypted DEK.
5. Backend clears the DEK buffer from memory after use.

## MongoDB Shape

```js
{
  owner: ObjectId,
  title: String,
  type: "secret" | "note" | "message" | "file",
  encryptedData: {
    algorithm: "aes-256-gcm",
    iv: String,
    authTag: String,
    ciphertext: String,
    encoding: "base64"
  },
  keyEnvelope: {
    encryptedDek: {
      algorithm: "aes-256-gcm",
      iv: String,
      authTag: String,
      ciphertext: String,
      encoding: "base64"
    },
    keyId: String,
    keyVersion: Number,
    wrappedAt: Date
  },
  metadata: {
    contentType: String,
    originalFileName: String,
    byteLength: Number,
    encryptionVersion: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Examples

Create encrypted secret:

```http
POST /api/encrypted-secrets
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "title": "GitHub token",
  "value": "ghp_example_secret_value",
  "type": "secret"
}
```

List metadata only:

```http
GET /api/encrypted-secrets
Authorization: Bearer <jwt>
```

Decrypt one secret:

```http
GET /api/encrypted-secrets/<secretId>/decrypt
Authorization: Bearer <jwt>
```

## Production Notes

Use a real KMS for production MEKs, such as AWS KMS, Azure Key Vault, Google Cloud KMS, or HashiCorp Vault. Environment variables are acceptable for local learning, but enterprise systems keep MEKs outside application code, Git, logs, and database backups.

For MEK rotation, add a new `MEK_KEY_ID`, decrypt each stored encrypted DEK with the old MEK, re-encrypt the DEK with the new MEK, and update only `keyEnvelope`. The large encrypted data payload does not need to change.
