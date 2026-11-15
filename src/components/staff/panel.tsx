/** EduTrack маягийн хэсэг: цагаан карт, дээд ирмэгт брэндийн зураас. Ажилтны бүх хуудсанд. */
export function Panel({
  title,
  action,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Хүснэгт мэт ирмэг хүртэл дэлгэгдэх агуулгад дотор зай хэрэггүй */
  flush?: boolean;
}) {
  return (
    <section className={`rounded-xl border-t-[3px] border-brand bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)] ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
          <h2 className="text-[17px] font-bold">{title}</h2>
          {action}
        </div>
      )}
      <div className={flush ? "pt-2" : "p-5 pt-3"}>{children}</div>
    </section>
  );
}
