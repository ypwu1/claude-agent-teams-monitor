"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/logs", label: "Logs", icon: "▤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[#27272a] bg-[#0d0d12] flex flex-col">
      <div className="p-4 border-b border-[#27272a]">
        <h1 className="text-lg font-bold tracking-tight text-white">
          claude-agent-teams-monitor
        </h1>
        <p className="text-xs text-[#71717a] mt-0.5">Monitor Dashboard</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#1a1a22] text-white"
                  : "text-[#71717a] hover:text-white hover:bg-[#131318]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#27272a] text-xs text-[#71717a]">
        Watching ~/.claude/
      </div>
    </aside>
  );
}
