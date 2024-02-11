import { Providers } from "../app/providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div>
        <main className="mx-auto max-w-screen-lg">{children}</main>
      </div>
    </Providers>
  );
}
