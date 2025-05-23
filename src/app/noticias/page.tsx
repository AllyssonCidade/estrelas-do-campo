
'use client'; // Mark as client component for hooks and animations

import * as React from 'react';
import { getNoticiasApi } from '@/lib/api'; // Import API function for noticias
import type { Noticia } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CalendarDays, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion for animations
import { Button } from '@/components/ui/button'; // For retry button

export default function NoticiasPage() {
  const [noticias, setNoticias] = React.useState<Noticia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // State for API errors

  // Memoized fetch function
  const fetchNoticias = React.useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous error
    console.log("NoticiasPage: Attempting to fetch noticias via API...");
    try {
        const fetchedNoticias = await getNoticiasApi(); // Call the updated API function
        console.log(`NoticiasPage: Fetched ${fetchedNoticias.length} noticias successfully.`);
        setNoticias(fetchedNoticias);
    } catch (fetchError: any) {
        const errorMessage = fetchError.message || "Erro desconhecido ao buscar notícias.";
        console.error("NoticiasPage: Failed to fetch noticias:", errorMessage);
        setError(errorMessage); // Set specific error message from API handler
    } finally {
        setLoading(false);
    }
  }, []); // Empty dependency array

  React.useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]); // Run fetch on mount

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08, // Slightly faster stagger
        duration: 0.2,
      },
    }),
  };

  // Loading Placeholder Component
  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-1">
       {[...Array(3)].map((_, i) => (
        <div key={`skeleton-${i}`} className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row bg-card border animate-pulse">
          {/* Image Placeholder */}
          <div className="relative w-full h-40 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted/60 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
          {/* Content Placeholder */}
          <div className="flex flex-col justify-between p-4 flex-grow space-y-2">
            <div className="h-6 w-3/4 bg-muted/60 rounded" /> {/* Title Skel */}
            <div className="h-4 w-full bg-muted/60 rounded" /> {/* Text Skel */}
            <div className="h-4 w-1/2 bg-muted/60 rounded" /> {/* Text Skel */}
            <div className="flex items-center gap-2 pt-2 border-t mt-auto border-border">
              <div className="h-4 w-4 rounded-full bg-muted/60" /> {/* Icon Skel */}
              <div className="h-4 w-20 bg-muted/60 rounded" /> {/* Date Skel */}
            </div>
          </div>
        </div>
       ))}
    </div>
  );

  // Error Display Component
  const ErrorDisplay = ({ errorMsg, onRetry }: { errorMsg: string; onRetry: () => void }) => (
     <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive">
        <AlertCircle className="h-10 w-10 mb-3" />
        <p className="font-semibold">Erro ao Carregar Notícias</p>
        <p className="text-sm">{errorMsg}</p>
        <Button onClick={onRetry} variant="destructive" size="sm" className="mt-4">
            Tentar Novamente
        </Button>
      </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <p className="text-center text-muted-foreground mt-10">Nenhuma notícia publicada recentemente.</p>
  );

  return (
    <div className="space-y-6 container mx-auto max-w-4xl py-8 px-4 min-h-[calc(100vh-14rem)]">
      <h1 className="text-2xl font-bold text-primary">Notícias do Time</h1>
      <p className="text-muted-foreground">Fique por dentro das novidades das Estrelas do Campo!</p>

      {loading ? <LoadingSkeleton /> :
       error ? <ErrorDisplay errorMsg={error} onRetry={fetchNoticias} /> :
       noticias.length === 0 ? <EmptyState /> : (
        <div className="grid gap-6 md:grid-cols-1">
          {noticias.map((noticia: Noticia, index: number) => (
            <motion.div
              key={noticia.id || index} // Use ID if available
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="w-full"
            >
              <Card className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row w-full bg-card border hover:shadow-lg transition-shadow duration-150">
                {/* Image */}
                <div className="relative w-full h-48 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted">
                    <Image
                      src={noticia.imagem || "https://via.placeholder.com/100/e2e8f0/64748b?text=N/A"} // Fallback placeholder
                      alt={`Imagem para ${noticia.titulo}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                      loading="lazy" // Use Next.js lazy loading
                      // Keep unoptimized for placeholders
                      unoptimized={noticia.imagem?.includes('via.placeholder.com')}
                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/100/fecaca/991b1b?text=Erro"; e.currentTarget.alt="Erro ao carregar imagem"; }}
                    />
                  </div>

                {/* Content */}
                <div className="flex flex-col justify-between p-4 flex-grow">
                  <div>
                    <CardHeader className="p-0 pb-2">
                      {/* Fix: Removed 'as' prop from CardTitle */}
                      <CardTitle className="text-lg text-primary">{noticia.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pb-2">
                      <p className="text-sm text-foreground line-clamp-3">{noticia.texto}</p>
                    </CardContent>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{noticia.data}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
