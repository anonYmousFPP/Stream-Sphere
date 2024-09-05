"use server"

import {
    IngressAudioEncodingPreset,
    IngressInput, 
    IngressClient, 
    RoomServiceClient, 
    TrackSource,
    type CreateIngressOptions,
    IngressVideoEncodingPreset, 
    IngressVideoOptions,
    IngressAudioOptions} from "livekit-server-sdk";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

const roomServiCe = new RoomServiceClient(
    process.env.LIVEKIT_API_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
);

const ingressClient = new IngressClient(process.env.LIVEKIT_API_URL!);

export const resetIngresses = async (hostIdentity:string) => {
    const ingresses = await ingressClient.listIngress({
        roomName: hostIdentity,
    })

    const rooms = await roomServiCe.listRooms([hostIdentity]);

    for(const room of rooms){
        await roomServiCe.deleteRoom(room.name);
    }

    for(const ingress of ingresses){
        if(ingress.ingressId){
            await ingressClient.deleteIngress(ingress.ingressId);
        }
    }
};

export const createIngress = async (ingressType : IngressInput) => {
    const self = await getSelf();

    await resetIngresses(self.id);

    const options: CreateIngressOptions = {
        name: self.username,
        roomName: self.id,
        participantName: self.username,
        participantIdentity: self.id,
    };

    if (ingressType === IngressInput.WHIP_INPUT) {
        options.bypassTranscoding = true;
    } else {
        options.video = new IngressVideoOptions({
            source: TrackSource.CAMERA,
            encodingOptions: {
                value: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
                case: "preset",
            },
        });

        options.audio = new IngressAudioOptions({
            source: TrackSource.MICROPHONE,
            encodingOptions: {
                value: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
                case: "preset",
            },
        });
    }

    const ingress = await ingressClient.createIngress(
        ingressType,
        options,
    );

    if(!ingress || !ingress.url || !ingress.streamKey){
        throw new Error("Failed to create ingress");
    }

    await db.stream.update({
        where:{userId: self.id},
        data:{
            ingressId: ingress.ingressId,
            serverUrl: ingress.url,
            streamKey: ingress.streamKey,
        }
    });
    revalidatePath(`/u/${self.username}/keys`);

    const plainIngress = {
        ingressId: ingress.ingressId,
        name: ingress.name,
        streamKey: ingress.streamKey,
        url: ingress.url,
        inputType: ingress.inputType,
        bypassTranscoding: ingress.bypassTranscoding,
        roomName: ingress.roomName,
        participantIdentity: ingress.participantIdentity,
        participantName: ingress.participantName,
        participantMetadata: ingress.participantMetadata,
        reusable: ingress.reusable,
        enableTranscoding: ingress.enableTranscoding,
        audio: ingress.audio ? {
            name: ingress.audio.name,
            source: ingress.audio.source,
            encodingOptions: ingress.audio.encodingOptions,
        } : null,
        video: ingress.video ? {
            name: ingress.video.name,
            source: ingress.video.source,
            encodingOptions: ingress.video.encodingOptions,
        } : null,
        state: ingress.state ? {
            status: ingress.state.status,
            error: ingress.state.error,
            roomId: ingress.state.roomId,
            startedAt: Number(ingress.state.startedAt), // convert BigInt to number
            endedAt: Number(ingress.state.endedAt),     // convert BigInt to number
            updatedAt: Number(ingress.state.updatedAt), // convert BigInt to number
            resourceId: ingress.state.resourceId,
            tracks: ingress.state.tracks,
        } : null,
    };

    return plainIngress;
}