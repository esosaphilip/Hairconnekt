Cloudflare R2 storage configuration

This project is set up to use Cloudflare R2 (S3-compatible) for storing provider portfolio images. The current implementation includes a placeholder R2Service and a StorageService that constructs public URLs from environment variables. To enable real uploads, you will need to provide credentials and complete the R2Service implementation.

Environment variables

Set the following variables in your environment (e.g., .env) to configure R2:

- R2_ACCOUNT_ID=your_account_id
- R2_ACCESS_KEY_ID=your_access_key_id
- R2_SECRET_ACCESS_KEY=your_secret_access_key
- R2_BUCKET=hairconnekt-images
- R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
  - Alternative names also supported:
    - R2_BUCKET_NAME (alias for R2_BUCKET)
    - R2_PUBLIC_URL (alias for R2_PUBLIC_BASE_URL)

Optional (for direct S3 client endpoint configuration):

- R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

Where it is used in code

- src/config/storage.config.ts defines the shape for R2 config and supports the aliases listed above.
- src/modules/storage/storage.service.ts reads R2_BUCKET and R2_PUBLIC_BASE_URL (or aliases) to construct the final public URL of uploaded images: `${publicBaseUrl}/${bucket}/providers/${providerId}/${timestamp}-${filename}`.
- src/modules/storage/r2.service.ts contains TODOs to initialize an S3Client and implement uploadObject/getObject using the AWS SDK v3. Once credentials are present, you can complete this integration.

Implementation guidance (to complete later)

1) Initialize an S3Client in R2Service with:
   - region: 'auto'
   - endpoint: process.env.R2_ENDPOINT or `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
   - credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }
2) Implement uploadObject(bucket, key, body) using PutObjectCommand.
3) Optionally implement getObject(bucket, key) using GetObjectCommand if needed.
4) Consider setting appropriate ACLs and content-type metadata.

Notes

- Until R2Service is implemented, uploads will return placeholder success in the service layer. The rest of the portfolio flow (create, update, delete, discover) can be smoke-tested using the constructed public URLs.
- The StorageService trims any trailing slash from R2_PUBLIC_BASE_URL to avoid double slashes in final URLs.