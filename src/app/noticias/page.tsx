
'use client'; // Mark as client component for hooks and animations

import * as React from 'react'; // Import React for useEffect/useState
import { getNoticiasApi } from '@/lib/api'; // Import API function for noticias
import type { Noticia } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CalendarDays, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { motion } from 'framer-motion'; // Import motion for animations
import { Button } from '@/components/ui/button'; // For retry button

export default function NoticiasPage() {
  const [noticias, setNoticias] = React.useState<Noticia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null); // State for API errors

  const fetchNoticias = async () => {
    setLoading(true);
    setError(null);
    try {
        const fetchedNoticias = await getNoticiasApi();
        setNoticias(fetchedNoticias);
    } catch (error: any) {
        console.error("Failed to fetch noticias from API:", error);
        setError(error.message || "Não foi possível carregar as notícias. Tente novamente mais tarde.");
    } finally {
        setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNoticias();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger animation
        duration: 0.2, // Faster fade-in
      },
    }),
  };

  return (
    <div className="space-y-6 container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold text-primary">Notícias do Time</h1>
      <p className="text-muted-foreground">Fique por dentro das novidades das Estrelas do Campo!</p>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-1">
           {[...Array(3)].map((_, i) => ( // Show 3 placeholders while loading
            <div key={`skeleton-${i}`} className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row bg-card border animate-pulse">
              {/* Image Placeholder */}
              <div className="relative w-full h-40 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
              {/* Content Placeholder */}
              <div className="flex flex-col justify-between p-4 flex-grow space-y-2">
                <div className="h-6 w-3/4 bg-muted rounded" /> {/* Title Skel */}
                <div className="h-4 w-full bg-muted rounded" /> {/* Text Skel */}
                <div className="h-4 w-1/2 bg-muted rounded" /> {/* Text Skel */}
                <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                  <div className="h-4 w-4 rounded-full bg-muted" /> {/* Icon Skel */}
                  <div className="h-4 w-20 bg-muted rounded" /> {/* Date Skel */}
                </div>
              </div>
            </div>
           ))}
        </div>
      ) : error ? ( // Display error message
         <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-semibold">Erro ao Carregar Notícias</p>
            <p className="text-sm">{error}</p>
            <Button onClick={fetchNoticias} variant="destructive" size="sm" className="mt-4">
                Tentar Novamente
            </Button>
          </div>
      ) : noticias.length === 0 ? (
        <p className="text-center text-muted-foreground mt-10">Nenhuma notícia publicada recentemente.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          {noticias.map((noticia: Noticia, index: number) => (
            <motion.div
              key={noticia.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="w-full" // Ensure motion div takes full width
            >
              <Card className="shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row w-full bg-card border">
                {/* Image */}
                <div className="relative w-full h-48 sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-muted">
                    <Image
                      // Use noticia.imagem directly, ensure it's a valid URL
                      src={noticia.imagem || "https://via.placeholder.com/100/cccccc/000000?text=Sem+Imagem"} // Fallback
                      alt={`Imagem para ${noticia.titulo}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                      loading="lazy"
                      unoptimized // Don't optimize placeholders from via.placeholder
                    />
                  </div>

                {/* Content */}
                <div className="flex flex-col justify-between p-4 flex-grow">
                  <div>
                    <CardHeader className="p-0 pb-2">
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

    