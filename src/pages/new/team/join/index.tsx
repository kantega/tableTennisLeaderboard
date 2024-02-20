"use client";

import JoinTeamForm from "../../../../components/team/join-team-form";

export default function PlayerPage() {
  return (
    <div className="container flex h-full flex-col items-center gap-8 px-4 py-4 ">
      <JoinTeamForm />
    </div>
  );
}