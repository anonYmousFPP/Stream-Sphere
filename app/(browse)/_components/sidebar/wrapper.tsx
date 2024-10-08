"use client"
import { useSidebar } from "@/store/use-sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { RecommendedSkeleton } from "./Recommended";
interface WrapperProps{
    children: React.ReactNode;
};

export const Wrapper = ({
    children,
}: WrapperProps) => {
    const {collapsed} = useSidebar((state) => state);
    return (
        <aside className={cn("fixed left-0 flex flex-col w-[70px] lg:w-60 h-full bg-background border-r border-[#2D2E35] z-50",
            collapsed && "lg:w-[70px]"
        )}
    >
            {children}
        </aside>
    )
} 