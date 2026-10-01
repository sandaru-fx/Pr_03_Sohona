import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact us about a Mathaka QR digital memorial.",
};

export default function ContactPage() {
  return <ContactClient />;
}
