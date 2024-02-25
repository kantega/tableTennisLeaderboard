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
import { CreateLeagueMatch } from "@/server/api/routers/leagueMatch/league-match-types";
import { useContext, useState } from "react";
import { TeamContext } from "@/contexts/teamContext/team-provider";
import { LeagueContext } from "@/contexts/leagueContext/league-provider";
import { useSession } from "next-auth/react";
import LeagueMatchCard from "@/components/leagueMatch/league-match-card";
import { sortAndFilterForInactivePlayers } from "../leagueUser/league-user-utils";
import {
  getLocalStorageRecentOpponents,
  getLocalStorageShowInactivePlayers,
  setLocalStorageRecentOpponents,
} from "./league-match-util";
import ShowInactivePlayersToggle from "./show-inactive-players-toggle";
import LoadingSpinner from "../loading";
import { type LeagueUserAndTeamUser } from "../leagueUser/league-user-types";
import HeaderLabel from "../header-label";

export default function AddLeagueMatchForm() {
  const { data: sessionData } = useSession();
  const { teamId } = useContext(TeamContext);
  const { leagueId } = useContext(LeagueContext);
  const [popoverWinnerOpen, setPopoverWinnerOpen] = useState(false);
  const [popoverLoserOpen, setPopoverLoserOpen] = useState(false);
  const [showInactivePlayers, setShowInactivePlayers] = useState(
    getLocalStorageShowInactivePlayers(),
  );
  const [recentOpponents, setRecentOpponents] = useState<string[]>(
    getLocalStorageRecentOpponents(leagueId),
  );

  const { data, isLoading } = api.leagueUser.getAllByLeagueId.useQuery({
    teamId,
    leagueId,
  });

  const form = useForm<z.infer<typeof CreateLeagueMatch>>({
    resolver: zodResolver(CreateLeagueMatch),
    defaultValues: {
      winnerId: sessionData?.user.id ?? "",
      loserId: sessionData?.user.id ?? "",
    },
  });
  const createMatchMutate = api.leagueMatch.create.useMutation({
    onSuccess: async () => {
      const winner = form.getValues("winnerId");
      const loser = form.getValues("loserId");

      if (winner !== sessionData?.user.id) recentOpponents.unshift(winner);
      if (loser !== sessionData?.user.id) recentOpponents.unshift(loser);

      setLocalStorageRecentOpponents(recentOpponents, leagueId);
      setRecentOpponents(getLocalStorageRecentOpponents(leagueId));

      form.reset();
      toast({
        title: "Success",
        description: `New match registered.`,
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
    createMatchMutate.mutate({ ...data, teamId, leagueId });
  }

  if (!data || isLoading || !sessionData) return <LoadingSpinner />;

  const filtedLeagueUsers = sortAndFilterForInactivePlayers(
    data.leagueUsersAndTeamUsers,
    showInactivePlayers,
    sessionData.user.id,
  );

  const winnerPlayer = filtedLeagueUsers.find(
    (player) => player.teamUser.userId === form.getValues("winnerId"),
  );

  const loserPlayer = filtedLeagueUsers.find(
    (player) => player.teamUser.userId === form.getValues("loserId"),
  );

  const watchLoserId = form.watch("loserId");
  const watchWinnerId = form.watch("winnerId");

  const setWinnerId = (id: string) => form.setValue("winnerId", id);
  const setLoserId = (id: string) => form.setValue("loserId", id);

  return (
    <>
      <ShowInactivePlayersToggle
        showInactivePlayers={showInactivePlayers}
        setShowInactivePlayers={setShowInactivePlayers}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative flex h-full w-full flex-col items-center justify-center gap-4 space-y-6"
        >
          <Button
            type="button"
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
                            ? filtedLeagueUsers.find(
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
                          {filtedLeagueUsers.map((player) => (
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
                                form.setValue(
                                  "winnerId",
                                  player.teamUser.userId,
                                );
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
                              ? filtedLeagueUsers.find(
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
                            {filtedLeagueUsers.map((player) => {
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
          {watchLoserId !== watchWinnerId &&
            watchLoserId !== "" &&
            watchWinnerId !== "" && (
              <Button
                disabled={createMatchMutate.isLoading}
                type="submit"
                className="m-auto w-full justify-center text-black"
              >
                {createMatchMutate.isLoading ? <LoadingSpinner /> : "Add match"}
              </Button>
            )}
          {!!winnerPlayer &&
            !!loserPlayer &&
            watchLoserId !== watchWinnerId && (
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
      {(!loserPlayer || !winnerPlayer || loserPlayer === winnerPlayer) && (
        <PickFromRecentOpponents
          users={filtedLeagueUsers}
          recentOpponents={recentOpponents}
          setWinnerId={setWinnerId}
          setLoserId={setLoserId}
        />
      )}
    </>
  );
}

function PickFromRecentOpponents({
  users,
  recentOpponents,
  setWinnerId,
  setLoserId,
}: {
  users: LeagueUserAndTeamUser[];
  recentOpponents: string[];
  setWinnerId: (id: string) => void;
  setLoserId: (id: string) => void;
}) {
  const recentOpponentsFiltered = users.filter((user) =>
    recentOpponents.includes(user.teamUser.userId),
  );

  if (recentOpponentsFiltered.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <HeaderLabel label="Pick from recent opponents" />
      {recentOpponentsFiltered.map((user) => (
        <div
          key={user.teamUser.userId}
          className="relative flex h-10 w-full items-center justify-center rounded-sm bg-gradient-to-r from-primary from-30% to-red-500 to-70%"
        >
          <Button
            className="absolute left-0 m-0 h-full w-2/5 p-0 hover:bg-transparent"
            variant="ghost"
            onClick={() => setWinnerId(user.teamUser.userId)}
          />
          <h1 className="z-20 text-2xl text-gray-900">
            {user.teamUser.gamerTag}
          </h1>
          <Button
            className="absolute right-0 m-0 h-full w-2/5 p-0 hover:bg-transparent"
            variant="ghost"
            onClick={() => setLoserId(user.teamUser.userId)}
          />
        </div>
      ))}
    </div>
  );
}
