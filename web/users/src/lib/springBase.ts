export function getSpringBase(): string {
  const base = process.env.NEXT_PUBLIC_SPRING_API_BASE;
  if (!base) {
    throw new Error(
      'Miljøvariabel NEXT_PUBLIC_SPRING_API_BASE mangler. ' +
      'Sett den i .env.local (for eksempel NEXT_PUBLIC_SPRING_API_BASE=http://localhost:8080)'
    );
  }
  return base;
}
