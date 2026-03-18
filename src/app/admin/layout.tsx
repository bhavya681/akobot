import { redirect } from "next/navigation";

export default function AdminLayoutWrapper({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  // Admin panel is temporarily disabled.
  redirect("/");
}
