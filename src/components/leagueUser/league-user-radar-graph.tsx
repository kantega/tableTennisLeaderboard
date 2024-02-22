import { type TeamUser, type LeagueMatch } from "@prisma/client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { getRadarData } from "./league-user-utils";

export interface LeagueMatchWithProfiles {
  winnerTeamUser: TeamUser;
  loserTeamUser: TeamUser;
  match: LeagueMatch;
}

interface Props {
  userId: string;
  leagueMatchesWithProfiles: LeagueMatchWithProfiles[];
}

export default function LeagueUserRivals({
  userId,
  leagueMatchesWithProfiles,
}: Props) {
  const { radarData } = getRadarData(leagueMatchesWithProfiles, userId);

  if (radarData.length < 3) return null;

  return (
    <span className="flex flex-col items-center justify-center">
      <h1 className="m-0 text-2xl">Winrate radar vs opponents</h1>
      <RadarChart
        cx={160}
        cy={160}
        outerRadius={100}
        width={320}
        height={320}
        data={radarData}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar
          name="Opponents WR radar"
          dataKey="WR"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </span>
  );
}
