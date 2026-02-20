import { useJobs } from "@/hooks/use-jobs";
import { Layout } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { Link } from "wouter";
import { Loader2, Calendar, FileText, ArrowRight, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function History() {
  const { data: jobs, isLoading } = useJobs();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Project History</h1>
            <p className="text-muted-foreground mt-1">Manage your past translations and transcripts.</p>
          </div>
          <Link href="/">
            <Button>New Project</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Start by translating your first YouTube Short.</p>
            <Link href="/">
              <Button>Create Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/jobs/${job.id}`}>
                  <div className="group bg-card hover:bg-muted/50 border border-border/50 hover:border-primary/20 rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-start md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            Project #{job.id}
                          </span>
                          <StatusBadge status={job.status} />
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{job.youtubeUrl}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="text-sm font-medium mr-2 hidden md:block">View Details</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
