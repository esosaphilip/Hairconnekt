export const securityConfig = () => ({
  // Secret pepper appended to user passwords before hashing (argon2 only)
  passwordPepper: process.env.PASSWORD_PEPPER || '',

  // Argon2id parameters (defaults are safe; can be tuned via env)
  argon2: {
    timeCost: parseInt(process.env.ARGON2_TIME_COST || '3', 10), // iterations
    memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10), // KiB (64 MB)
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '1', 10),
  },
});