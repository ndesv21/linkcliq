import { contactEmail, GITHUB_URL } from "@/lib/env"

export function Contact() {
  const email = contactEmail()
  if (email) return <a href={`mailto:${email}`}>{email}</a>
  return <a href={`${GITHUB_URL}/issues`}>open an issue on GitHub</a>
}
