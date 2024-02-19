import { api } from "@/utils/api";
import { useContext } from "react";
import { TeamContext } from "@/contexts/teamContext/team-provider";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { userIsAdmin } from "@/utils/role";
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
  const { role, teamId } = useContext(TeamContext);
  const updateTeamNameMutate = api.league.updateName.useMutation({
    onSuccess: async () => {
      void ctx.league.findAll.invalidate({ id: teamId });
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
      id: teamId,
      leagueId: leagueId,
    });
  };

  if (!userIsAdmin(role)) return null;

  return (
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
                <Input placeholder="Navn..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" className=" aspect-square h-6 w-6">
          <Check size={16} />
        </Button>
      </form>
    </Form>
  );
}
