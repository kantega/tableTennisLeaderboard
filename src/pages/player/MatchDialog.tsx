import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { matchResults, updateEloRating } from "@/utils/elo";
import { TrashIcon } from "lucide-react";

import { type TableTennisMatch } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";

export default function MatchDialog({
  children,
  match,
  id,
}: {
  children: React.ReactNode;
  match: TableTennisMatch;
  id: string;
}) {
  const ctx = api.useContext();
  const deleteMatch = api.match.delete.useMutation({
    onSuccess: () => ctx.match.findAllById.invalidate({ id }),
  });
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Match</DialogTitle>
        </DialogHeader>
        <MatchCard match={match} />
        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            onClick={() => {
              deleteMatch.mutate({ id: match.id });
            }}
          >
            <TrashIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MatchCard({ match }: { match: TableTennisMatch }) {
  return (
    <Card className="relative w-[min(350px,100%)]">
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between gap-2">
          <div className="w-[35%]">
            <Avatar>
              <AvatarImage
                className="rounded-full"
                src="https://github.com/shadcn.png"
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <b className="text-md">{match.player1Id}</b>
            <b className="text-sm"> {" (" + match.prePlayer1Elo + ")"}</b>
          </div>
          <h1 className="text-foreground">vs.</h1>
          <div className="w-[35%]">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
                className="rounded-full"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <b className="text-md">{match.player2Id}</b>
            <b className="text-sm"> {" (" + match.prePlayer2Elo + ")"}</b>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className=" flex flex-row justify-between">
          <Badge className=" bg-green-600 text-2xl">
            +
            {updateEloRating(
              match.prePlayer1Elo,
              match.prePlayer2Elo,
              matchResults.player111,
            )[0] - match.prePlayer1Elo}
          </Badge>
          <Badge className=" bg-red-600 text-2xl">
            {updateEloRating(
              match.prePlayer1Elo,
              match.prePlayer2Elo,
              matchResults.player111,
            )[1] - match.prePlayer2Elo}
          </Badge>
        </div>
        <p className="absolute bottom-2 right-2 text-xs">
          Played at: {getTime(match.createdAt)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
}

const getTime = (date: Date) => {
  const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  return (
    hours +
    ":" +
    minutes +
    " " +
    (date.getDate() + 1) +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getFullYear()
  );
};
