import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  maxPlayTime?: number; // Time limit for the question in seconds
  onAutoPlayStart?: () => void;
  onAutoPlayEnd?: () => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  autoPlay = false,
  maxPlayTime,
  onAutoPlayStart,
  onAutoPlayEnd,
  className = '' 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Auto-play when component mounts for audio recognition questions
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
          setHasAutoPlayed(true);
          onAutoPlayStart?.();
        } catch (error) {
          console.warn('Auto-play failed, user interaction required:', error);
          // Note: Some browsers require user interaction before playing audio
        }
      };
      
      // Small delay to ensure audio is loaded
      const timer = setTimeout(playAudio, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, hasAutoPlayed, onAutoPlayStart]);

  // Auto-stop audio when question time is up
  useEffect(() => {
    if (maxPlayTime && isPlaying) {
      const timer = setTimeout(() => {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
          onAutoPlayEnd?.();
        }
      }, maxPlayTime * 1000);

      return () => clearTimeout(timer);
    }
  }, [maxPlayTime, isPlaying, onAutoPlayEnd]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <div className="flex-1">
          <div className="w-full bg-gray-300 rounded-full h-2 mb-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
      
      {autoPlay && (
        <div className="mt-2 text-xs text-gray-500">
          🎵 Audio started automatically - Listen carefully!
        </div>
      )}
    </div>
  );
};