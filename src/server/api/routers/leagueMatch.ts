import {
  createTRPCRouter,
  protectedProcedure,
  teamMemberProcedure,
} from "@/server/api/trpc";
import { teamIdSchema } from "@/server/types/teamTypes";
import { updateEloRating } from "@/utils/elo";
import { addEloToLatestEloList, newLeagueUserStreak } from "@/utils/match";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const leagueMatchRouter = createTRPCRouter({
  create: teamMemberProcedure
    .input(
      z
        .object({
          leagueId: z.string().min(1),
          winnerId: z.string().min(1),
          loserId: z.string().min(1),
        })
        .extend(teamIdSchema.shape),
    )
    .mutation(async ({ ctx, input }) => {
      const leagueWinner = await ctx.db.leagueUser.findFirst({
        where: {
          userId: input.winnerId,
          leagueId: input.leagueId,
          teamId: input.id,
        },
      });

      if (!leagueWinner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Winner not found in league",
        });
      }

      const leagueLoser = await ctx.db.leagueUser.findFirst({
        where: {
          userId: input.loserId,
          leagueId: input.leagueId,
          teamId: input.id,
        },
      });

      if (!leagueLoser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loser not found in league",
        });
      }

      const leagueMatch = await ctx.db.leagueMatch.create({
        data: {
          preLoserElo: leagueLoser.elo,
          preWinnerElo: leagueWinner.elo,
          leagueId: input.leagueId,
          winnerId: input.winnerId,
          loserId: input.loserId,
          teamId: input.id,
        },
      });

      const matchNewElos = updateEloRating(leagueWinner.elo, leagueLoser.elo);

      // update stats on league users and league
      await ctx.db.leagueUser.update({
        where: {
          id: leagueWinner.id,
          teamId: input.id,
        },
        data: {
          elo: matchNewElos[0],
          matchCount: leagueWinner.matchCount + 1,
          streak: newLeagueUserStreak({ streak: leagueWinner.streak, add: 1 }),
          latestEloGain: addEloToLatestEloList(
            leagueWinner.latestEloGain,
            matchNewElos[0] - leagueWinner.elo,
          ),
        },
      });

      await ctx.db.leagueUser.update({
        where: {
          id: leagueLoser.id,
          teamId: input.id,
        },
        data: {
          elo: matchNewElos[1],
          matchLossCount: leagueLoser.matchLossCount + 1,
          matchCount: leagueLoser.matchCount + 1,
          streak: newLeagueUserStreak({ streak: leagueLoser.streak, add: 1 }),
          latestEloGain: addEloToLatestEloList(
            leagueLoser.latestEloGain,
            matchNewElos[0] - leagueLoser.elo,
          ),
        },
      });

      await ctx.db.league.update({
        where: { id: input.leagueId, teamId: input.id },
        data: {
          matchCount: {
            increment: 1,
          },
        },
      });

      return { leagueMatch };
    }),
  getAll: protectedProcedure
    .input(z.object({ leagueId: z.string().min(1) }).extend(teamIdSchema.shape))
    .query(async ({ ctx, input }) => {
      const leagueMatches = await ctx.db.leagueMatch.findMany({
        where: {
          leagueId: input.leagueId,
          teamId: input.id,
        },
      });

      // todo: add winner and loser profiles and match details

      return { leagueMatches };
    }),
  getAllForUser: protectedProcedure
    .input(z.object({ leagueId: z.string().min(1) }).extend(teamIdSchema.shape))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const leagueMatches = await ctx.db.leagueMatch.findMany({
        where: {
          leagueId: input.leagueId,
          OR: [{ winnerId: userId }, { loserId: userId }],
          teamId: input.id,
        },
      });

      // todo: add winner and loser profiles and match details

      return { leagueMatches };
    }),
  getAllById: protectedProcedure
    .input(
      z
        .object({
          leagueUserId: z.string().min(1),
          leagueId: z.string().min(1),
        })
        .extend(teamIdSchema.shape),
    )
    .query(async ({ ctx, input }) => {
      const leagueUser = await ctx.db.leagueUser.findUnique({
        where: { id: input.leagueUserId },
      });

      if (!leagueUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League user not found",
        });
      }

      const userId = leagueUser.userId;

      const leagueMatches = await ctx.db.leagueMatch.findMany({
        where: {
          leagueId: input.leagueId,
          OR: [{ winnerId: userId }, { loserId: userId }],
          teamId: input.id,
        },
      });

      return { leagueMatches };
    }),
});
