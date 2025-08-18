import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Next.js sandbox</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        This is the Next.js migration branch. Your Vite app remains intact.
      </p>
      <div className="mt-4">
        <Link href="/site-visits" className="underline text-blue-600">Go to Site Visits</Link>
      </div>
    </main>
  );
}