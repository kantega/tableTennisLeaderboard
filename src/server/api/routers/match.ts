import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const matchRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        player1Id: z.string().min(1),
        player2Id: z.string().min(1),
        winner: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const player1 = await ctx.db.player.findUnique({
        where: { id: input.player1Id },
      });

      if (!player1) {
        throw new Error(`Player ${input.player1Id} not found`);
      }

      const player2 = await ctx.db.player.findUnique({
        where: { id: input.player2Id },
      });

      if (!player2) {
        throw new Error(`Player ${input.player2Id} not found`);
      }

      //todo: update player elos

      return ctx.db.match.create({
        data: {
          player1Id: input.player1Id,
          player2Id: input.player1Id,
          winner: input.winner,
          prePlayer1Elo: player1.elo,
          prePlayer2Elo: player2.elo,
        },
      });
    }),

  findAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.match.findMany();
  }),
});
