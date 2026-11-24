import { Contact } from "@/components/legal/contact"

export const metadata = { title: "Terms" }

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated 24 November 2026.</p>
      <p>
        These terms cover linkcliq.com, the hosted version of LinkCliq. By creating an account you agree to them. The LinkCliq software is open source under the
        MIT license; if you run your own copy, these terms do not apply to it.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be at least 13 years old, or older if the law where you live requires it.</li>
        <li>Use an email address you control. It is the only way to recover your account.</li>
        <li>You are responsible for everything that happens under your account.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You own the pages, links and images you publish. You give us permission to store, display and serve them, which is what we need to run the service. You
        can delete any page or your whole account at any time from Settings.
      </p>

      <h2>What you may not do</h2>
      <ul>
        <li>Phishing, malware, scams, or links that trick people about where they lead.</li>
        <li>Anything illegal, including content that sexualises minors, sells illegal goods or infringes someone else&apos;s rights.</li>
        <li>Harassment, threats or hate directed at people or groups.</li>
        <li>Pretending to be another person, brand or organisation.</li>
        <li>Spam, or using LinkCliq to get around another platform&apos;s ban or penalty.</li>
        <li>Adult content without the sensitive content setting turned on.</li>
        <li>Overloading, scraping or attacking the service.</li>
      </ul>
      <p>
        We may suspend a page or close an account without notice when we believe it breaks these rules or puts visitors at risk. If you think we got it wrong,{" "}
        <Contact />.
      </p>

      <h2>Browser escape and other platforms</h2>
      <p>
        Browser escape is optional and you decide where it runs. You are responsible for following the rules of the platforms where you share your links,
        including their advertising policies.
      </p>

      <h2>A free service, as is</h2>
      <p>
        LinkCliq is free. We work to keep it fast and available, but we provide it as is, without warranties of any kind. We may change features or end the
        service; if we end it, we will give you notice and time to export your data.
      </p>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, such as lost sales, arising from your use of LinkCliq.
      </p>

      <h2>Changes</h2>
      <p>If we change these terms in a meaningful way, we will update the date above and tell account holders by email.</p>

      <h2>Contact</h2>
      <p>
        Questions or reports: <Contact />.
      </p>
    </>
  )
}
