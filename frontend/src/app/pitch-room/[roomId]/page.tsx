'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import { api } from '@/lib/api';
import { PitchTimer } from '@/components/room/PitchTimer';
import { ChatPanel } from '@/components/room/ChatPanel';
import { VideoPlayer } from '@/components/room/VideoPlayer';
import { WaitingRoom } from '@/components/room/WaitingRoom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Play,
  Square,
  Users,
  Shield,
  MonitorUp,
} from 'lucide-react';

export default function PitchRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const roomId = params.roomId as string;

  const {
    participants,
    messages,
    timer,
    isPitchActive,
    isWarning,
    setParticipants,
    addParticipant,
    removeParticipant,
    addMessage,
    setTimer,
    setPitchActive,
    setWarning,
    setConnected,
    resetRoom,
  } = useRoomStore();

  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Local media states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get(`/pitches/room/${roomId}`).catch(() => ({ data: { data: null } }));
        setSessionDetails(data.data);
      } catch (err) {
        console.error('Error fetching room details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchSession();
  }, [roomId]);

  // Handle Socket.IO connection upon leaving waiting room
  useEffect(() => {
    if (inWaitingRoom || !user) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    
    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('room:join', { roomId });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      if (err.message.includes('AUTHENTICATION_ERROR')) {
        router.push('/login');
      }
    });

    socket.on('room:joined', (data) => {
      setParticipants(data.users || []);
      setPitchActive(data.isPitchActive);
      setTimer(data.remainingSeconds);
    });

    socket.on('room:user-joined', (data) => {
      addParticipant({
        socketId: data.socketId,
        userId: data.userId,
        name: data.user?.name || 'Invitado',
        role: data.user?.role || 'SPECTATOR',
      });
    });

    socket.on('room:user-left', (data) => {
      removeParticipant(data.socketId);
    });

    socket.on('pitch:started', (data) => {
      setPitchActive(true);
      setTimer(data.durationSeconds || 300);
      setWarning(false);
    });

    socket.on('pitch:ended', (data) => {
      setPitchActive(false);
      setWarning(false);
    });

    socket.on('timer:tick', (data) => {
      setTimer(data.remainingSeconds);
    });

    socket.on('timer:warning', () => {
      setWarning(true);
    });

    socket.on('timer:expired', () => {
      setPitchActive(false);
      setWarning(false);
    });

    socket.on('chat:message', (message) => {
      addMessage(message);
    });

    // Acquire user webcam/mic
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
      })
      .catch((err) => {
        console.warn('Could not acquire camera/microphone:', err.message);
      });

    return () => {
      if (socket) {
        socket.emit('room:leave');
        socket.disconnect();
      }
      resetRoom();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [inWaitingRoom, user, roomId]);

  const handleStartPitch = () => {
    if (socketRef.current) {
      socketRef.current.emit('pitch:start', {
        roomId,
        durationSeconds: 300, // 5 minutes
      });
    }
  };

  const handleEndPitch = () => {
    if (socketRef.current) {
      socketRef.current.emit('pitch:end', {
        roomId,
        reason: 'Concluido por el presentador',
      });
    }
  };

  const handleSendMessage = (content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:message', {
        roomId,
        content,
      });
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(screenStream);
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // switch back to camera
          navigator.mediaDevices?.getUserMedia({ video: true, audio: true }).then((camStream) => {
            setLocalStream(camStream);
          });
        };
      } else {
        navigator.mediaDevices?.getUserMedia({ video: true, audio: true }).then((camStream) => {
          setLocalStream(camStream);
          setIsScreenSharing(false);
        });
      }
    } catch (err) {
      console.warn('Screen share cancelled or failed');
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Cargando sala..." />;

  const isHost =
    user?.role === 'ADMIN' ||
    sessionDetails?.pitchSession?.startup?.userId === user?.id;

  if (inWaitingRoom) {
    return (
      <WaitingRoom
        title={sessionDetails?.pitchSession?.title || `Sala de Pitch #${roomId.slice(0, 6)}`}
        startupName={sessionDetails?.pitchSession?.startup?.name}
        isHost={isHost}
        onJoin={() => setInWaitingRoom(false)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[#030712] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6 bg-[#0b0f19]/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
            QP
          </div>
          <div>
            <h2 className="text-xs font-bold truncate max-w-xs sm:max-w-md">
              {sessionDetails?.pitchSession?.title || 'Quick Pitch Room'}
            </h2>
            <p className="text-[10px] text-blue-400 font-semibold">
              {sessionDetails?.pitchSession?.startup?.name || 'Startup Pitch'}
            </p>
          </div>
        </div>

        {/* Centralized Timer */}
        <PitchTimer
          remainingSeconds={timer}
          isWarning={isWarning}
          isActive={isPitchActive}
        />

        {/* Participants count & Host action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 px-3 py-1 text-xs text-slate-300">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span>{participants.length} conectados</span>
          </div>

          {isHost && (
            <div>
              {!isPitchActive ? (
                <button
                  onClick={handleStartPitch}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Iniciar 5 Min</span>
                </button>
              ) : (
                <button
                  onClick={handleEndPitch}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Finalizar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Stage Area */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          {/* Main Presenter Stage */}
          <div className="flex-1 flex items-center justify-center min-h-[300px] max-h-[65vh]">
            <VideoPlayer
              stream={localStream}
              userName={`${user?.firstName} ${user?.lastName} (Tú)`}
              userRole={user?.role}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              isPresenter={true}
            />
          </div>

          {/* Connected Participants Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {participants
              .filter((p) => p.userId !== user?.id)
              .map((p) => (
                <div
                  key={p.socketId}
                  className="flex items-center justify-between rounded-xl bg-[#0b0f19] border border-slate-800 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-blue-400 font-bold text-xs">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[90px]">
                      {p.name}
                    </span>
                  </div>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase">
                    {p.role}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Right Side Chat Panel */}
        <div className="w-80 border-l border-slate-800 p-3 hidden md:block">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={user?.id}
          />
        </div>
      </div>

      {/* Bottom Control Dock */}
      <div className="h-16 border-t border-slate-800 bg-[#0b0f19]/90 backdrop-blur px-6 flex items-center justify-center gap-4 z-20">
        <button
          onClick={toggleMic}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
          title={isMuted ? 'Desmutear' : 'Mutear micrófono'}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            isVideoOff ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
          title={isVideoOff ? 'Encender cámara' : 'Apagar cámara'}
        >
          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
        </button>

        <button
          onClick={handleScreenShare}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
          title="Compartir pantalla"
        >
          <MonitorUp className="h-4 w-4" />
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/90 text-white hover:bg-red-700 transition"
          title="Salir de la sala"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
