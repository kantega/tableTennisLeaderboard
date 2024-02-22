"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { ArrowLeftRight, Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/utils/api";
import { type CreateLeagueMatch, CreateMatch } from "@/server/types/matchTypes";
import { useContext, useState } from "react";
import { sortTeamUsersByGamerTag } from "@/utils/player";
import { TeamContext } from "@/contexts/teamContext/team-provider";
import { LeagueContext } from "@/contexts/leagueContext/league-provider";
import { useSession } from "next-auth/react";
import LeagueMatchCard from "@/components/leagueMatch/league-match-card";

export default function AddLeagueMatchForm() {
  const { data: sessionData } = useSession();
  const { teamId } = useContext(TeamContext);
  const { leagueId } = useContext(LeagueContext);
  const [popoverWinnerOpen, setPopoverWinnerOpen] = useState(false);
  const [popoverLoserOpen, setPopoverLoserOpen] = useState(false);

  const { data, isLoading } = api.teamUser.getAll.useQuery({
    id: teamId,
    leagueId,
  });
  const form = useForm<z.infer<typeof CreateLeagueMatch>>({
    resolver: zodResolver(CreateMatch),
    defaultValues: {
      winnerId: sessionData?.user.id ?? "",
      loserId: sessionData?.user.id ?? "",
    },
  });
  const createMatchMutate = api.leagueMatch.create.useMutation({
    onSuccess: async () => {
      form.reset();
      toast({
        title: "Success",
        description: "Match registered.",
        variant: "default",
      });
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      console.log(errorMessage);
      toast({
        title: "Error",
        description:
          errorMessage?.title ??
          errorMessage?.description ??
          "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof CreateLeagueMatch>) {
    createMatchMutate.mutate({ ...data, id: teamId, leagueId });
  }

  if (!data || isLoading) return null;

  const players = sortTeamUsersByGamerTag(data);

  const winnerPlayer = players.find(
    (player) => player.teamUser.userId === form.getValues("winnerId"),
  );

  const loserPlayer = players.find(
    (player) => player.teamUser.userId === form.getValues("loserId"),
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex h-full w-full flex-col items-center justify-center gap-4 space-y-6"
      >
        <Button
          className="absolute right-6 top-24 rotate-90 rounded-full bg-primary p-2 text-black"
          onClick={() => {
            const tempValue = form.getValues("winnerId");
            form.setValue("winnerId", form.getValues("loserId"));
            form.setValue("loserId", tempValue);
          }}
        >
          <ArrowLeftRight />
        </Button>
        <div className="flex w-full flex-col gap-4">
          <FormField
            control={form.control}
            name="winnerId"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel>Winner</FormLabel>
                <Popover
                  open={popoverWinnerOpen}
                  onOpenChange={setPopoverWinnerOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? players.find(
                              (player) =>
                                player.teamUser.userId === field.value,
                            )?.teamUser.gamerTag
                          : "Select player"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="h-52 p-0">
                    <Command>
                      <CommandInput
                        className="placeholder-primary"
                        placeholder="Pick winner..."
                      />
                      <CommandEmpty>No player found.</CommandEmpty>
                      <CommandGroup className="overflow-y-scroll">
                        {players.map((player) => (
                          <CommandItem
                            value={player.teamUser.gamerTag}
                            key={player.teamUser.userId}
                            onSelect={() => {
                              if (
                                player.teamUser.userId ===
                                form.getValues("loserId")
                              )
                                form.setValue("loserId", "");

                              form.setValue(
                                "loserId",
                                form.getValues("loserId"),
                              );
                              form.setValue("winnerId", player.teamUser.userId);
                              setPopoverWinnerOpen(false);
                              if (form.getValues("loserId") === "")
                                setPopoverLoserOpen(true);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                player.teamUser.userId === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {player.teamUser.gamerTag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {form.watch("winnerId") !== "" && (
          <div className="flex w-full flex-col">
            <FormField
              control={form.control}
              name="loserId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Loser</FormLabel>
                  <Popover
                    open={popoverLoserOpen}
                    onOpenChange={setPopoverLoserOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? players.find(
                                (player) =>
                                  player.teamUser.userId === field.value,
                              )?.teamUser.gamerTag
                            : "Select player"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="h-52 w-[200px] p-0">
                      <Command>
                        <CommandInput
                          className="placeholder-red-600"
                          placeholder="Velg taper..."
                        />
                        <CommandEmpty>No player found.</CommandEmpty>
                        <CommandGroup className="overflow-y-scroll">
                          {players.map((player) => {
                            if (
                              player.teamUser.userId ===
                              form.getValues("winnerId")
                            )
                              return null;

                            return (
                              <CommandItem
                                value={player.teamUser.gamerTag}
                                key={player.teamUser.userId}
                                onSelect={() => {
                                  form.setValue(
                                    "loserId",
                                    player.teamUser.userId,
                                  );
                                  setPopoverLoserOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    player.teamUser.userId === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {player.teamUser.gamerTag}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {loserPlayer !== winnerPlayer && (
          <Button
            type="submit"
            className="m-auto w-full justify-center text-black"
            onClick={() => onSubmit(form.getValues())} //todo: theres a bug here, i have to manually call the onSubmit function
          >
            Add match
          </Button>
        )}
        {!!winnerPlayer && !!loserPlayer && (
          <LeagueMatchCard
            winnerTeamUser={winnerPlayer.teamUser}
            loserTeamUser={loserPlayer.teamUser}
            match={{
              preWinnerElo: winnerPlayer.leagueUser.elo,
              preLoserElo: loserPlayer.leagueUser.elo,
            }}
            includeSeparator={false}
          />
        )}
      </form>
    </Form>
  );
}