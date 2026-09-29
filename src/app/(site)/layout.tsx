export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-28 pb-8">{children}</main>;
}
