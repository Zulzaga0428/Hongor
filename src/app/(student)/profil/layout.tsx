/** Компьютер дээр уншихад тохиромжтой өргөн. */
export default function Narrow({ children }: { children: React.ReactNode }) {
  return <div className="lg:max-w-3xl">{children}</div>;
}
