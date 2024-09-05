"use client"

import { Heart } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { onFollow, onUnfollow } from "@/actions/follow";
import { start } from "repl";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ActionsPops{
    hostIdentity: string;
    isFollowing: boolean;
    isHost: boolean;
};
export const Actions = ({
    hostIdentity,
    isFollowing,
    isHost,
}: ActionsPops) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const {userId} = useAuth();

    const handleFollow = () => {
        startTransition(() => {
            onFollow(hostIdentity)
                .then((data) => toast.success(`You have unfollowed ${data.following.username}`))
                .catch(() => toast.error("Something went wrong"));
        })
    }

    const handleUnfollow = () => {
        startTransition(() => {
            onFollow(hostIdentity)
                .then((data) => toast.success(`You are not following ${data.following.username}`))
                .catch(() => toast.error("Something went wrong"));
        })
    }

    const toggleFollow = () => {
        if(!userId){
            return router.push("/sign-in");
        }

        if(isHost)  return ;

        if(isFollowing){
            handleUnfollow();
        }else{
            handleFollow();
        }
    }

    return (
        <Button 
            disabled={isPending || isHost}
            onClick={toggleFollow}
            variant="primary"
            size="sm"
            className="w-full lg:w-auto"
        >
            
        <Heart className={cn(
            "h-4 w-4 mr-2",
            isFollowing ? "fill-white" : "fill-none"
        )} />
        {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    )
}

export const ActionsSekelton = () => {
    return (
        <Skeleton className="h-10 w-full lg:w-24" />
    );
};