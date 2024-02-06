import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/utils/api";
import { updateEloRating } from "@/utils/elo";
import { Minus, Plus, TrashIcon } from "lucide-react";
import { sortMatchesByDate } from "@/utils/match";

export default function MatchHistory({ id }: { id: string }) {
  const ctx = api.useContext();
  const { data, isLoading } = api.match.findAllById.useQuery({ id });
  const deleteMatch = api.match.delete.useMutation({
    onSuccess: () => ctx.match.findAllById.invalidate({ id }),
  });

  if (!data || isLoading) return null;
  data.sort(sortMatchesByDate);

  return (
    <Table className="w-[min(500px,100%)]">
      <TableHeader>
        <TableRow>
          <TableHead>Vinner</TableHead>
          <TableHead>Taper</TableHead>
          <TableHead>
            <Plus color="limegreen" />
            <Minus color="red" />
          </TableHead>
          <TableHead>SLETT</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((match) => (
          <TableRow key={match.id}>
            <TableCell className="font-medium">
              {`${match.player1Id} (${match.prePlayer1Elo})`}
            </TableCell>
            <TableCell className="font-medium">
              {`${match.player2Id} (${match.prePlayer2Elo})`}
            </TableCell>
            <TableCell
              className={
                id === match.winner ? "text-green-500" : "text-red-500"
              }
            >
              {id === match.winner
                ? "+" +
                  (updateEloRating(
                    match.prePlayer1Elo,
                    match.prePlayer2Elo,
                    "player111",
                  )[0] -
                    match.prePlayer1Elo)
                : updateEloRating(
                    match.prePlayer1Elo,
                    match.prePlayer2Elo,
                    "player111",
                  )[1] - match.prePlayer2Elo}
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost">
                    <TrashIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Er du sikker på at du vil slette kampen?
                    </DialogTitle>
                  </DialogHeader>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
