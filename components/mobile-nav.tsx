"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
export function MobileNav({ links }: { links: string[][] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);
  return (
    <details className="mobile-nav" ref={ref}>
      <summary aria-label="القائمة">
        <Menu />
      </summary>
      <nav aria-label="قائمة الهاتف">
        {links.map(([href, title]) => (
          <Link key={href} href={href}>
            {title}
          </Link>
        ))}
        <Link href="/register">التسجيل</Link>
        <Link href="/contact">تواصل معنا</Link>
      </nav>
    </details>
  );
}
