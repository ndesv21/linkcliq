import { Contact } from "@/components/legal/contact"

export const metadata = { title: "Privacy" }

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated 24 November 2026.</p>
      <p>
        This policy covers linkcliq.com, the hosted version of LinkCliq. It explains what we collect from people who create pages (account holders) and from
        people who visit those pages (visitors). If someone runs LinkCliq on their own server, their instance is theirs and this policy does not apply to it.
      </p>

      <h2>Account holders</h2>
      <ul>
        <li>Your name, email address and password. The password is stored as a salted hash, never in plain text.</li>
        <li>Session records with the IP address and browser you signed in from, used to keep you signed in and protect your account.</li>
        <li>Everything you publish: page text, images, links and settings.</li>
        <li>If you connect SocialClaw, your API key, encrypted at rest.</li>
      </ul>

      <h2>Visitors</h2>
      <p>LinkCliq sets no cookies and stores nothing on visitors&apos; devices. For each page view or link click we record:</p>
      <ul>
        <li>The time, the page and the link.</li>
        <li>
          A visitor ID made by hashing the IP address and browser with a secret that changes every day. It counts unique visitors and cannot follow anyone
          from one day to the next. The IP address itself is not stored.
        </li>
        <li>The country, looked up from the IP address when the request arrives.</li>
        <li>Device type, browser, operating system, the referring website&apos;s domain, UTM tags and the in-app browser, if any.</li>
      </ul>
      <p>
        Page owners can add Google Analytics or a Meta Pixel to their page. When they do, those services collect data under their own policies, and the page
        owner is responsible for that choice.
      </p>

      <h2>How we use it</h2>
      <p>
        To run the service, show page owners their analytics, keep accounts secure and send password reset emails. We do not sell data, show ads or build
        profiles of visitors.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>Railway, which hosts the servers and database.</li>
        <li>Resend, which delivers our emails.</li>
      </ul>
      <p>Country lookups use the DB-IP Lite database on our own servers; no visitor data is sent to DB-IP.</p>

      <h2>How long we keep it</h2>
      <p>
        Account data stays until you delete your account. Analytics stay while the page exists. Deleting a page removes its links and analytics; deleting your
        account removes everything tied to it. Backups are overwritten on a rolling basis.
      </p>

      <h2>Your choices</h2>
      <p>
        You can export your analytics as CSV, edit your details, and delete pages or your whole account from Settings. For anything else, including a copy of
        your data, <Contact />.
      </p>

      <h2>Children</h2>
      <p>LinkCliq is not meant for children under 13, and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>If this policy changes in a meaningful way, we will update the date above and tell account holders by email.</p>
    </>
  )
}
