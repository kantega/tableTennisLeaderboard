import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { teamIdSchema } from "@/server/api/routers/team/team-types";
import { type TeamUser, type League, type LeagueUser } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const leagueUserRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ leagueId: z.string().min(1) }).extend(teamIdSchema.shape))
    .query(async ({ ctx, input }) => {
      const leagueUser = await ctx.db.leagueUser.findFirst({
        where: {
          leagueId: input.leagueId,
          userId: ctx.session.user.id,
          teamId: input.teamId,
        },
      });

      if (!leagueUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League user not found",
        });

      const teamUser = await ctx.db.teamUser.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!teamUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team user not found",
        });

      const league = await ctx.db.league.findUnique({
        where: {
          id: leagueUser.leagueId,
        },
      });

      if (!league)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found",
        });

      return { leagueUser, teamUser, league };
    }),
  findById: protectedProcedure
    .input(
      z.object({ leagueUserId: z.string().min(1) }).extend(teamIdSchema.shape),
    )
    .query(async ({ ctx, input }) => {
      const leagueUser = await ctx.db.leagueUser.findUnique({
        where: {
          id: input.leagueUserId,
        },
      });

      if (!leagueUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League user not found",
        });

      const teamUser = await ctx.db.teamUser.findFirst({
        where: {
          userId: leagueUser.userId,
        },
      });

      if (!teamUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team user not found",
        });

      const league = await ctx.db.league.findUnique({
        where: {
          id: leagueUser.leagueId,
        },
      });

      if (!league)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found",
        });

      return { leagueUser, teamUser, league };
    }),
  findAll: protectedProcedure
    .input(teamIdSchema)
    .query(async ({ ctx, input }) => {
      const teamUser = await ctx.db.teamUser.findFirst({
        where: {
          userId: ctx.session.user.id,
          teamId: input.teamId,
        },
      });

      if (!teamUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team user not found",
        });

      const leagueUsers = await ctx.db.leagueUser.findMany({
        where: {
          userId: teamUser.userId,
          teamId: teamUser.teamId,
        },
      });

      const leagueAndLeagueUsers = (
        await Promise.all(
          leagueUsers.map(async (leagueUser) => {
            const league = await ctx.db.league.findUnique({
              where: {
                id: leagueUser.leagueId,
              },
            });

            return { league, leagueUser };
          }),
        )
      ).filter(
        (
          leagueAndLeagueUser,
        ): leagueAndLeagueUser is { league: League; leagueUser: LeagueUser } =>
          leagueAndLeagueUser.league !== null,
      );

      return { leagueAndLeagueUsers, teamUser };
    }),

  findAllByLeagueId: protectedProcedure
    .input(z.object({ leagueId: z.string().min(1) }).extend(teamIdSchema.shape))
    .query(async ({ ctx, input }) => {
      const leagueUsers = await ctx.db.leagueUser.findMany({
        where: {
          leagueId: input.leagueId,
        },
      });

      const leagueUsersAndTeamUsers = (
        await Promise.all(
          leagueUsers.map(async (leagueUser) => {
            const teamUser = await ctx.db.teamUser.findFirst({
              where: {
                userId: leagueUser.userId,
                teamId: leagueUser.teamId,
              },
            });

            return { teamUser, leagueUser };
          }),
        )
      ).filter(
        (
          leagueAndLeagueUser,
        ): leagueAndLeagueUser is {
          teamUser: TeamUser;
          leagueUser: LeagueUser;
        } => leagueAndLeagueUser.teamUser !== null,
      );

      return { leagueUsersAndTeamUsers };
    }),
  findAllById: protectedProcedure
    .input(
      z.object({ teamUserId: z.string().min(1) }).extend(teamIdSchema.shape),
    )
    .query(async ({ ctx, input }) => {
      const teamUser = await ctx.db.teamUser.findUnique({
        where: {
          id: input.teamUserId,
        },
      });

      if (!teamUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team user not found",
        });

      const leagueUsers = await ctx.db.leagueUser.findMany({
        where: {
          userId: teamUser.userId,
          teamId: teamUser.teamId,
        },
      });

      const leagueAndLeagueUsers = (
        await Promise.all(
          leagueUsers.map(async (leagueUser) => {
            const league = await ctx.db.league.findUnique({
              where: {
                id: leagueUser.leagueId,
              },
            });

            return { league, leagueUser };
          }),
        )
      ).filter(
        (
          leagueAndLeagueUser,
        ): leagueAndLeagueUser is { league: League; leagueUser: LeagueUser } =>
          leagueAndLeagueUser.league !== null,
      );

      return { leagueAndLeagueUsers, teamUser };
    }),
});
