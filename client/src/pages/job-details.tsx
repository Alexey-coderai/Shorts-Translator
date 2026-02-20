import { useRoute } from "wouter";
import { useJob } from "@/hooks/use-jobs";
import { Layout } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { Loader2, ArrowLeft, Download, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function JobDetails() {
  const [, params] = useRoute("/jobs/:id");
  const id = parseInt(params?.id || "0");
  const { data: job, isLoading, error } = useJob(id);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
  const alignment = (job.alignment as Array<{ zh: string, ru: string }>) || [];

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
              We are currently transcribing the Chinese audio and translating it to Russian with word-level mapping.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Video Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="aspect-[9/16] w-full bg-black/5 rounded-2xl overflow-hidden shadow-lg border border-border/50 relative group">
              <ReactPlayer 
                url={job.youtubeUrl}
                width="100%"
                height="100%"
                controls
                light
                className="absolute top-0 left-0"
              />
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <h4 className="font-semibold text-sm mb-2 text-foreground">Source Video</h4>
              <p className="text-xs text-muted-foreground break-all">{job.youtubeUrl}</p>
            </div>
          </div>

          {/* Transcript/Translation Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TooltipProvider delayDuration={0}>
              {/* Chinese Source */}
              <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Interactive Chinese Transcript
                  </h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-medium leading-relaxed text-lg text-foreground/80">
                  {alignment.length > 0 ? (
                    <div className="flex flex-wrap gap-x-1 gap-y-2">
                      {alignment.map((item, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <span 
                              className={cn(
                                "cursor-help transition-all duration-200 rounded px-1",
                                hoveredIndex === idx ? "bg-primary/20 text-primary scale-105" : "hover:bg-muted"
                              )}
                              onMouseEnter={() => setHoveredIndex(idx)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              {item.zh}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-primary text-primary-foreground font-bold">
                            {item.ru}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ) : job.transcript || (
                    <span className="text-muted-foreground italic text-base font-normal">
                      {isPending ? "Waiting for transcription..." : "No transcript available."}
                    </span>
                  )}
                </div>
              </div>

              {/* Russian Translation */}
              <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-primary/5">
                  <h3 className="font-semibold text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Interactive Russian Translation
                  </h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-medium leading-relaxed text-lg text-foreground/90">
                  {alignment.length > 0 ? (
                    <div className="flex flex-wrap gap-x-1 gap-y-2">
                      {alignment.map((item, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <span 
                              className={cn(
                                "cursor-help transition-all duration-200 rounded px-1",
                                hoveredIndex === idx ? "bg-primary/20 text-primary scale-105 underline decoration-primary/40" : "hover:bg-muted"
                              )}
                              onMouseEnter={() => setHoveredIndex(idx)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              {item.ru}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-red-500 text-white font-bold">
                            {item.zh}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ) : job.translation || (
                    <span className="text-muted-foreground italic text-base font-normal">
                      {isPending ? "Waiting for translation..." : "No translation available."}
                    </span>
                  )}
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Layout>
  );
}
