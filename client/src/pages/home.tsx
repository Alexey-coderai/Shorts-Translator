import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, Sparkles, Youtube } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateJob } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { insertVideoJobSchema } from "@shared/schema";

const formSchema = insertVideoJobSchema;
type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createJob = useCreateJob();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    createJob.mutate(data, {
      onSuccess: (job) => {
        toast({
          title: "Job Started!",
          description: "We've started processing your video.",
        });
        setLocation(`/jobs/${job.id}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Translation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
            Translate YouTube Shorts <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Chinese to Russian
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Instantly generate captions for any Chinese YouTube Short and get a high-quality Russian translation.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </div>
              <Input
                {...register("youtubeUrl")}
                placeholder="Paste YouTube Shorts URL..."
                className="pl-10 h-14 rounded-2xl text-lg shadow-sm border-2 border-border focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary transition-all"
                disabled={createJob.isPending}
              />
            </div>
            {errors.youtubeUrl && (
              <p className="text-sm text-destructive font-medium text-left px-2">
                {errors.youtubeUrl.message}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
              disabled={createJob.isPending}
            >
              {createJob.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start Translating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left"
        >
          {[
            { title: "Smart Transcription", desc: "Advanced speech-to-text for clear Chinese captions." },
            { title: "Instant Translation", desc: "AI-powered translation into natural-sounding Russian." },
            { title: "Video Preview", desc: "Watch the original video alongside the generated text." }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
}
