"use client";

import { LeagueContext } from "@/contexts/leagueContext/league-provider";
import { TeamContext } from "@/contexts/teamContext/team-provider";
import { api } from "@/utils/api";
import { useContext } from "react";
import LeagueMatchHistoryByDate from "./league-match-history-by-date";
import LoadingSpinner from "../loading";

export default function LeagueMatchHistory({
  leagueName,
}: {
  leagueName: string;
}) {
  const { leagueId } = useContext(LeagueContext);
  const { teamId } = useContext(TeamContext);
  const { data, isLoading } = api.leagueMatch.getAll.useQuery({
    leagueId,
    teamId,
  });

  if (isLoading || !data) return <LoadingSpinner />;

  const sortedLeagueMatchesWithProfiles = data.leagueMatchesWithProfiles.sort(
    (a, b) => b.match.createdAt.getTime() - a.match.createdAt.getTime(),
  );

  return (
    <>
      {sortedLeagueMatchesWithProfiles.length === 0 && (
        <p className="rounded-sm bg-background-tertiary p-4">
          No matches found for {leagueName}.
          <br />
          Maybe you should play some games?
        </p>
      )}
      <LeagueMatchHistoryByDate
        sortedLeagueMatchesWithProfiles={sortedLeagueMatchesWithProfiles}
      />
      <span className="py-10" />
    </>
  );
}
