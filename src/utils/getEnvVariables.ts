export default function getEnvVariables() {
  const envVars = ["SECRET", "DATABASE_URL"] as const;
  const map: { [key: string]: string } = {};

  envVars.forEach((envVar) => {
    const _envVar = process.env?.[envVar];

    if (_envVar) {
      map[envVar] = _envVar;
    } else {
      throw new Error(`${envVar} missing in environment variables`);
    }
  });

  return map as { [key in (typeof envVars)[number]]: string };
}
