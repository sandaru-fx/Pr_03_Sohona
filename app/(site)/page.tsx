import Image from "next/image";
import Link from "next/link";
import { SHARED_PACKAGE_LIMITS } from "@/lib/packages";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const limits = SHARED_PACKAGE_LIMITS;
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { retentionYears: 'asc' }
  });

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-border bg-[#0B0D0F]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-plaque-v8.jpg"
            alt="Mathaka QR memorial plaque with candle, flowers, and sunset frame"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[72%_45%] sm:object-[65%_45%]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[68%] max-w-2xl bg-gradient-to-r from-[#0B0D0F]/88 via-[#0B0D0F]/45 to-transparent sm:w-[52%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#0B0D0F]/25 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col justify-center px-10 pt-20 sm:px-14 lg:px-20 sm:pt-24">
          <div className="max-w-xl rounded-2xl bg-[#0B0D0F]/40 px-6 py-8 backdrop-blur-[2px] sm:max-w-2xl sm:px-9 sm:py-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]">
            <p className="sohona-fade-up whitespace-nowrap font-sans text-5xl font-semibold tracking-tight text-[#F5F1E8] sm:text-6xl md:text-7xl">
              Mathaka QR
            </p>
            <h1
              className="sohona-fade-up mt-4 font-sans text-2xl font-medium leading-snug tracking-tight text-[#F5F1E8] sm:mt-5 sm:text-3xl md:text-[2rem] md:leading-snug"
              style={{ animationDelay: "80ms" }}
            >
              Digital remembrance. Private by design.
            </h1>
            <p
              className="sohona-fade-up mt-4 max-w-md font-sans text-lg leading-8 text-[#F5F1E8]/90 sm:text-xl sm:leading-8"
              style={{ animationDelay: "140ms" }}
            >
              A respectful digital place for temples and families — private
              memories stay under family control.
            </p>
            <div
              className="sohona-fade-up mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                href="/contact"
                className="inline-flex h-12 min-h-12 items-center justify-center rounded-xl bg-gold px-7 font-sans text-base font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
              >
                Create a Memorial
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 min-h-12 items-center justify-center rounded-xl border border-[#2A2E33] bg-[#181C20]/90 px-7 font-sans text-base font-medium text-[#F5F1E8] backdrop-blur-sm transition duration-300 hover:border-gold/40"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
            How Mathaka QR works
          </p>
          <h2 className="mt-4 max-w-xl font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            Three quiet steps
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-400">
            From the temple desk to a family living room — remembrance moves
            gently, without public accounts or noisy feeds.
          </p>
          <ol className="mt-16 grid gap-14 sm:grid-cols-3 sm:gap-16">
            {[
              {
                title: "Temple creates the memorial",
                body: "Staff set up a name-only profile, choose a package, and share a private setup link with the family.",
              },
              {
                title: "Family preserves memories",
                body: "With a 6-digit PIN, the family adds statements, photos, video, and voice — never through a public account.",
              },
              {
                title: "Visitors remember via QR",
                body: "A unique QR opens a calm memorial page. Optional PIN keeps the most private moments protected.",
              },
            ].map((item, index) => (
              <li key={item.title} className="sohona-fade-up">
                <p className="font-sans text-sm tabular-nums text-gold/80">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-sans text-xl font-medium leading-snug text-[#F5F1E8] sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-gray-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Voice / stories felt */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-32 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-40">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#121518]">
            <Image
              src="/feature-voice.jpg"
              alt="Phone playing a family voice memory beside headphones and a handwritten note"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Voice & presence
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl sm:leading-tight">
              Some stories are felt, not only spoken.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Families can preserve a quiet voice note — a greeting, a blessing,
              a song — kept private behind the memorial PIN. Listeners come
              through the QR, not a public timeline.
            </p>
            <ul className="mt-8 space-y-3 text-base leading-7 text-gray-400">
              <li className="border-l border-gold/40 pl-4">
                Up to {limits.maxAudioSeconds / 60} minutes of voice or audio
              </li>
              <li className="border-l border-gold/40 pl-4">
                Stored privately — temple admin cannot open it
              </li>
              <li className="border-l border-gold/40 pl-4">
                Played gently on the memorial page, never as a feed
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Privacy + locked book */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-32 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-40">
          <div className="order-2 sm:order-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Privacy promise
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl sm:leading-tight">
              Your memories remain private to your family.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Temple administrators manage profiles, packages, and QR codes
              only. They cannot open statements, photos, videos, audio, or
              visitor comments. Privacy is not a setting — it is the product.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              A family PIN is the key. Without it, the deepest memories stay
              closed — like a journal kept under lock.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex text-base font-medium text-gold transition-opacity duration-300 hover:opacity-80"
            >
              How privacy works →
            </Link>
          </div>
          <div className="relative order-1 aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#121518] sm:order-2">
            <Image
              src="/feature-privacy.jpg"
              alt="Leather-bound journal with a small padlock resting on the cover"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </div>
        </div>
      </section>

      {/* Words / messages */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-32 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-40">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#121518]">
            <Image
              src="/feature-words.jpg"
              alt="Handwritten note that reads Always with you beside a pen and candlelight"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Words that stay
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl sm:leading-tight">
              Messages written with care — not for likes.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Families leave statements. Visitors may leave respectful comments
              through the QR. There are no reactions, rankings, or public
              profiles — only space to say what matters.
            </p>
            <ul className="mt-8 space-y-3 text-base leading-7 text-gray-400">
              <li className="border-l border-gold/40 pl-4">
                Up to {limits.maxStatementWords} words in Sinhala or English
              </li>
              <li className="border-l border-gold/40 pl-4">
                Up to {limits.maxComments} visitor messages on the memorial
              </li>
              <li className="border-l border-gold/40 pl-4">
                Family can remove a comment; temple cannot read private text
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Family together */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-10 py-32 sm:grid-cols-2 sm:gap-20 lg:gap-24 sm:px-14 lg:px-20 sm:py-40">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#121518]">
            <Image
              src="/feature-family.jpg"
              alt="Family sitting together on a hill looking toward a sunset over water"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              For families
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl sm:leading-tight">
              Remembrance that gathers people — without putting them on display.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Mathaka QR is built so temples can offer a dignified digital
              memorial, while the family keeps control of what is private and
              what visitors may see.
            </p>
          </div>
        </div>
      </section>

      {/* Packages preview */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-7xl px-10 py-32 sm:px-14 lg:px-20 sm:py-40">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
            Packages
          </p>
          <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            Same care. Different years.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-400">
            Content limits are identical. What changes is how long the memorial
            is designed to be kept. Retention begins when family setup is
            completed.
          </p>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#2A2E33] bg-[#2A2E33] sm:grid-cols-3">
            {packages.map((item) => (
                <li
                  key={item.id}
                  className="bg-[#181C20] px-8 py-10 sm:px-10 sm:py-12"
                >
                  <p className="text-sm text-gray-500">{item.name}</p>
                  <p className="mt-3 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8]">
                    {item.retentionYears}
                    <span className="ml-1 text-lg font-normal text-gray-400">
                      years
                    </span>
                  </p>
                  <p className="mt-4 text-base leading-7 text-gray-400">
                    Up to {limits.maxImages} photos · video ≤{" "}
                    {limits.maxVideoSeconds}s · statements ≤{" "}
                    {limits.maxStatementWords} words
                  </p>
                </li>
            ))}
          </ul>
          <Link
            href="/packages"
            className="mt-10 inline-flex text-base font-medium text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Compare packages →
          </Link>
        </div>
      </section>

      {/* About + Contact */}
      <section className="bg-background-secondary">
        <div className="mx-auto grid max-w-7xl gap-20 px-10 py-32 sm:grid-cols-2 sm:gap-20 sm:px-14 lg:px-20 sm:py-40">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              About
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
              Built for temples
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-400">
              A dignified way to support families — without turning remembrance
              into a social feed.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex text-base font-medium text-gold transition-opacity duration-300 hover:opacity-80"
            >
              Read more →
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Contact
            </p>
            <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
              Begin with a conversation
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-400">
              Speak with your temple about starting a memorial for someone you
              love.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 min-h-12 items-center rounded-xl bg-gold px-6 text-base font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
            >
              Contact the temple
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
