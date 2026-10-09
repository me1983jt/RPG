import { createFileRoute } from "@tanstack/react-router";
import { RPG } from "@/components/RPG";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <RPG />;
}
