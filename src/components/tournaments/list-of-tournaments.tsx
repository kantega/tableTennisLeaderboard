import { useLeagueId } from "@/contexts/leagueContext/league-provider";
import { api } from "@/utils/api";
import {
  type TeamUser,
  type SwissTournament,
  type SwissTournamentUser,
} from "@prisma/client";
import Link from "next/link";
import LoadingSpinner from "../loading";
import MessageBox from "../message-box";
import TournamentCard from "./tournament-card";
import { useTeamId } from "@/contexts/teamContext/team-provider";
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { filterTournaments } from "./tournament-util";
import { getLocalStorageToggleValue } from "../ui-localstorage/localstorage-utils";
import { LocalStorageCheckbox } from "../ui-localstorage/localstorage-checkbox";
import MinorHeaderLabel from "../minor-header-label";

export default function ListOfTournaments() {
  const teamId = useTeamId();
  const leagueId = useLeagueId();
  const keyShowCompleted = leagueId + "showCompletedTournaments";
  const keyShowOpen = leagueId + "showOpen";
  const keyShowYours = leagueId + "showYours";

  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(
    getLocalStorageToggleValue(keyShowCompleted),
  );
  const [showOpen, setShowOpen] = useState(
    getLocalStorageToggleValue(keyShowOpen, true),
  );

  const [showYours, setShowYours] = useState(
    getLocalStorageToggleValue(keyShowYours),
  );
  const [tournaments, setTournaments] = useState<SwissTournament[]>([]);

  const { data, isLoading } = api.swissTournament.getAll.useQuery({
    teamId,
    leagueId,
  });

  useMemo(() => {
    if (!data) return;
    let newData = data.tournaments;
    if (searchQuery !== "") newData = filterTournaments(newData, searchQuery);
    if (!showCompleted)
      newData = newData.filter((t) => t.status !== "COMPLETED");
    if (!showOpen) newData = newData.filter((t) => !t.isOpen);
    if (showYours)
      newData = newData.filter(
        (t) =>
          data.swissProfiles.find((s) => s.swissTournamentId === t.id) !==
          undefined,
      );

    setTournaments(newData);
  }, [data, searchQuery, showCompleted, showOpen, showYours]);

  if (isLoading) return <LoadingSpinner />;
  if (!data)
    return <MessageBox>Theres no tournament for your league :(</MessageBox>;

  return (
    <>
      <Input
        tabIndex={-1}
        autoFocus={false}
        className="sticky top-16 z-10"
        placeholder="search for tournament..."
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value.currentTarget.value);
        }}
      />
      <MinorHeaderLabel headerText="Filter type of tournament" />
      <div className="flex flex-wrap gap-4">
        <LocalStorageCheckbox
          isToggled={showOpen}
          setIsToggled={setShowOpen}
          localStorageKey={keyShowOpen}
          label="Open for registration"
        />
        <LocalStorageCheckbox
          isToggled={showCompleted}
          setIsToggled={setShowCompleted}
          localStorageKey={keyShowCompleted}
          label="Completed"
        />
        <LocalStorageCheckbox
          isToggled={showYours}
          setIsToggled={setShowYours}
          localStorageKey={keyShowYours}
          label="Includes you"
        />
      </div>

      <ul className="flex flex-col gap-2">
        {tournaments.map((tournament) => {
          const swissUser = data.swissProfiles.find(
            (s) => s.swissTournamentId === tournament.id,
          );

          return (
            <TournamentCardLink
              key={tournament.id}
              tournament={tournament}
              swissUser={swissUser}
              teamUser={data.teamUser ?? undefined}
            />
          );
        })}
      </ul>
    </>
  );
}

function TournamentCardLink({
  tournament,
  swissUser,
  teamUser,
}: {
  tournament: SwissTournament;
  swissUser?: SwissTournamentUser;
  teamUser?: TeamUser;
}) {
  return (
    <Link href={`/tournament/swiss/${tournament.id}`}>
      <TournamentCard
        tournament={tournament}
        swissUser={swissUser}
        teamUser={teamUser}
      />
    </Link>
  );
}
