import { api } from "@/utils/api";
import { useTeamId } from "@/contexts/teamContext/team-provider";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from "../loading";
import TeamAdmin from "../auhtVisibility/team-admin";

const ChangeTeamNameType = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 characters.",
  }),
});

export default function ChangeLeagueName({
  leagueId,
  leagueName,
  setChangeLeagueName,
}: {
  leagueId: string;
  leagueName: string;
  setChangeLeagueName: (value: boolean) => void;
}) {
  const form = useForm<z.infer<typeof ChangeTeamNameType>>({
    resolver: zodResolver(ChangeTeamNameType),
    defaultValues: {
      name: leagueName,
    },
  });

  const ctx = api.useUtils();
  const teamId = useTeamId();
  const updateTeamNameMutate = api.league.updateName.useMutation({
    onSuccess: async () => {
      void ctx.league.getAll.invalidate({ teamId });
      setChangeLeagueName(false);

      toast({
        title: "Success",
        description: "League name updated.",
        variant: "success",
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

  const onSubmit = (data: { name: string }) => {
    updateTeamNameMutate.mutate({
      name: data.name,
      teamId,
      leagueId: leagueId,
    });
  };

  return (
    <TeamAdmin>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-2/3 items-center gap-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={updateTeamNameMutate.isLoading}
            type="submit"
            size="icon"
            className=" aspect-square h-6 w-6"
          >
            {updateTeamNameMutate.isLoading ? (
              <LoadingSpinner />
            ) : (
              <Check size={16} />
            )}
          </Button>
        </form>
      </Form>
    </TeamAdmin>
  );
}
