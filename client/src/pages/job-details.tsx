import { useRoute } from "wouter";
import { useJob } from "@/hooks/use-jobs";
import { Layout } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { Loader2, ArrowLeft, Download, RefreshCw, AlertTriangle, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

export default function JobDetails() {
  const [, params] = useRoute("/jobs/:id");
  const id = parseInt(params?.id || "0");
  const { data: job, isLoading, error } = useJob(id);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground">We couldn't find the project you're looking for.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isPending = job.status === "pending" || job.status === "processing";
  const alignment = (job.alignment as Array<{ zh: string, ru: string, pinyin: string, start?: number }>) || [];

  const handlePhraseClick = (seconds?: number) => {
    if (seconds !== undefined && playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
      setPlaying(true);
    }
  };

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0]);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(value[0], 'fraction');
    }
  };

  const handleSkip = (amount: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + amount, 'seconds');
    }
  };

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back to History
              </Link>
            </div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              Project #{job.id}
              <StatusBadge status={job.status} />
            </h1>
            <p className="text-muted-foreground text-sm">
              Created on {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isPending && (
              <Button variant="outline" disabled className="animate-pulse">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </Button>
            )}
            <Button variant="outline" disabled={!job.translation}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Processing State */}
        {isPending && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-card border border-border/50 shadow-sm text-center space-y-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h3 className="text-xl font-semibold">AI is working on it</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are currently transcribing Chinese, generating Pinyin, and translating to Russian.
            </p>
          </motion.div>
        )}

        {/* Failed State */}
        {job.status === "failed" && (
          <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 text-destructive flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Processing Failed</h3>
              <p className="text-destructive/80 mt-1">{job.error || "An unknown error occurred while processing this video."}</p>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TooltipProvider delayDuration={0}>
            {/* Chinese Source */}
            <div className="flex flex-col h-[700px] bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Chinese (Hover for Pinyin + Russian)
                </h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-bold leading-relaxed text-3xl text-foreground/80">
                {alignment.length > 0 ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-4">
                    {alignment.map((item, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <span 
                            className={cn(
                              "cursor-pointer transition-all duration-200 rounded px-1",
                              hoveredIndex === idx ? "bg-primary/20 text-primary scale-105" : "hover:bg-muted"
                            )}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          >
                            {item.zh}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary text-primary-foreground p-3 space-y-1 text-base">
                          <div className="text-sm opacity-80 font-mono">{item.pinyin}</div>
                          <div className="font-bold border-t border-primary-foreground/20 pt-1">{item.ru}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ) : job.transcript || (
                  <span className="text-muted-foreground italic text-xl font-normal">
                    {isPending ? "Waiting for transcription..." : "No transcript available."}
                  </span>
                )}
              </div>
            </div>

            {/* Russian Translation */}
            <div className="flex flex-col h-[700px] bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-primary/5">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Russian Translation
                </h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-bold leading-relaxed text-3xl text-foreground/90">
                {alignment.length > 0 ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-4">
                    {alignment.map((item, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <span 
                            className={cn(
                              "cursor-pointer transition-all duration-200 rounded px-1",
                              hoveredIndex === idx ? "bg-primary/20 text-primary scale-105 underline decoration-primary/40" : "hover:bg-muted"
                            )}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          >
                            {item.ru}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 text-white p-3 space-y-1 text-base">
                          <div className="font-bold">{item.zh}</div>
                          <div className="text-sm opacity-90 font-mono border-t border-white/20 pt-1">{item.pinyin}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ) : job.translation || (
                  <span className="text-muted-foreground italic text-xl font-normal">
                    {isPending ? "Waiting for translation..." : "No translation available."}
                  </span>
                )}
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </Layout>
  );
}
