'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, User } from 'lucide-react';

interface VideoPlayerProps {
  stream?: MediaStream | null;
  userName: string;
  userRole?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isPresenter?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  userName,
  userRole,
  isMuted = false,
  isVideoOff = false,
  isPresenter = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900 border ${
        isPresenter ? 'border-teal-500 shadow-teal-500/10 shadow-lg' : 'border-slate-800'
      } flex items-center justify-center aspect-video w-full`}
    >
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <User className="h-8 w-8" />
          </div>
          <span className="text-xs font-medium text-slate-400">{userName}</span>
        </div>
      )}

      {/* Floating Info Overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur">
        <span className="text-xs font-semibold text-white truncate max-w-[120px]">
          {userName}
        </span>
        {userRole && (
          <span className="rounded bg-teal-600/80 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
            {userRole}
          </span>
        )}
      </div>

      {/* Media status indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {isMuted && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white">
            <MicOff className="h-3.5 w-3.5" />
          </div>
        )}
        {isVideoOff && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white">
            <VideoOff className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
