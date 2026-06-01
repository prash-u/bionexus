import { useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { routes } from "@/app/routes";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

type NavLinkProps = Omit<LinkProps, "className"> & {
  className?: string | ((state: { isActive: boolean }) => string);
};

const normalizePath = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized;
};

function getCurrentPath() {
  return normalizePath(window.location.pathname || "/");
}

function navigate(to: string) {
  const next = normalizePath(to);
  if (getCurrentPath() === next) return;
  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useCurrentPath() {
  const [path, setPath] = useState(() => getCurrentPath());

  useEffect(() => {
    const listener = () => setPath(getCurrentPath());
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);

  return path;
}

export function Link({ to, onClick, ...props }: LinkProps) {
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && event.button === 0) {
          event.preventDefault();
          navigate(to);
        }
      }}
      {...props}
    />
  );
}

export function NavLink({ to, className, ...props }: NavLinkProps) {
  const path = useCurrentPath();
  const isActive = path === normalizePath(to);
  const resolvedClassName = typeof className === "function" ? className({ isActive }) : className;
  return <Link to={to} className={resolvedClassName} {...props} />;
}

export function CurrentRoute() {
  const path = useCurrentPath();
  const active = useMemo(() => routes.find((route) => route.path === path) ?? routes[0], [path]);
  return active.element;
}
