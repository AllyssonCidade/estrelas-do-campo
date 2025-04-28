
'use client'; // Mark as client component for hooks and animations

import * as React from 'react';
import { getEventosApi } from '@/lib/api'; // Import API function for events
import type { Evento } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Map, Building, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import motion for animations

// --- Hero Section ---
function HeroSection() {
  return (
    <section className="relative bg-cover bg-center text-white py-16 sm:py-24 px-4 text-center overflow-hidden h-[250px] sm:h-[350px] flex flex-col items-center justify-center"
             style={{
                 // Use a relevant and high-quality background image
                 backgroundImage: "url('https://image.pollinations.ai/prompt/women%20soccer%20team%20celebrating%20victory%20on%20field%20at%20sunset%2C%20brazilian%20community%20background%2C%20warm%20light%2C%20cinematic')",
                 backgroundSize: "cover",
                 backgroundPosition: "center", // Center the image better
            }}>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div> {/* Slightly increased opacity */}

      {/* Content wrapper */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h1
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-4xl sm:text-5xl font-bold mb-4 text-accent" // Gold text
           style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }} // Enhanced shadow
        >
          Estrelas do Campo
        </motion.h1>
         <motion.h2
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="text-xl sm:text-2xl font-semibold mb-4 text-white" // Changed to H2 for structure
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}
        >
          Força, Cultura e Inclusão
        </motion.h2>
        <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="text-base sm:text-lg mb-8 text-gray-100" // Slightly lighter text
        >
          Apoie o futebol feminino e junte-se à nossa comunidade!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Smooth scroll Button */}
          <Button
            size="lg"
            variant="accent" // Gold background
            className="font-semibold shadow-md transition-transform duration-200 hover:scale-105 text-accent-foreground" // Added hover effect
            onClick={(e) => {
              e.preventDefault();
              const agendaSection = document.getElementById('agenda-section');
              if (agendaSection) {
                agendaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            aria-label="Ver a agenda de eventos" // More specific aria-label
          >
            Ver Agenda
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// --- Apresentação Section ---
function ApresentacaoSection() {
   const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={itemVariants}
          className="text-2xl sm:text-3xl font-bold text-primary mb-6">
          Quem Somos
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.2 } } }}
          className="text-foreground mb-10 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          As Estrelas do Campo são mais que um time: somos um movimento de inclusão, empoderamento e cultura. Nosso futebol une a comunidade e inspira mulheres a brilharem!
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Image 1 */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.4 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4 relative aspect-[3/2]">
               <Image
                  // Use a more specific placeholder or a real image URL
                  src="https://via.placeholder.com/300x200/22C55E/FFFFFF?text=União+do+Time"
                  alt="Time de futebol feminino celebrando união"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  unoptimized // Keep unoptimized for placeholders
                />
            </div>
            <p className="text-accent font-semibold text-sm">Juntas, somos imbatíveis!</p>
          </motion.div>
           {/* Image 2 */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.6 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4 relative aspect-[3/2]">
               <Image
                  src="https://via.placeholder.com/300x200/FBBF24/1F2937?text=Ação+no+Campo"
                  alt="Jogadora de futebol em ação no campo"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  unoptimized // Keep unoptimized for placeholders
               />
            </div>
            <p className="text-accent font-semibold text-sm">O campo é nosso palco!</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Locais Section ---
function LocaisSection() {
   const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.15, duration: 0.4 },
    }),
  };

  const locais = [
    {
      nome: "Campo Municipal",
      endereco: "Rua do Esporte, 123, Cidade Fictícia", // Example address
      descricao: "Nosso lar para treinos e jogos emocionantes!",
      // Use more descriptive placeholder text or real image URLs
      imagem: "https://via.placeholder.com/300x200/4ade80/1f2937?text=Campo+Municipal",
      alt: "Foto do Campo Municipal",
      icon: <Map className="h-6 w-6 text-primary" />
    },
    {
      nome: "Estádio Central",
      endereco: "Av. Central, 456, Cidade Fictícia", // Example address
      descricao: "Palco dos grandes amistosos e celebrações!",
      imagem: "https://via.placeholder.com/300x200/fbbf24/1f2937?text=Estádio+Central",
      alt: "Foto do Estádio Central",
      icon: <Building className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section className="py-12 px-4 bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          className="text-2xl sm:text-3xl font-bold text-primary mb-8">
          Onde Jogamos
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locais.map((local, index) => (
            <motion.div
              key={local.nome}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={cardVariants}
            >
              <Card className="overflow-hidden shadow-lg rounded-lg h-full flex flex-col text-left bg-card border hover:shadow-xl transition-shadow duration-200">
                <div className="relative h-48 w-full bg-muted"> {/* Slightly larger image area */}
                   <Image
                      src={local.imagem}
                      alt={local.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                      unoptimized // Keep unoptimized for placeholders
                    />
                </div>
                <CardHeader className="flex-row items-center gap-3 pb-2 pt-4 px-4">
                  {local.icon}
                  <CardTitle className="text-xl text-primary">{local.nome}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-1 px-4 pb-4">
                  <p className="text-sm text-muted-foreground">{local.endereco}</p>
                  <p className="text-base text-foreground">{local.descricao}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Agenda Section Component ---
function AgendaSection() {
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchEventos = React.useCallback(async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log("AgendaSection: Attempting to fetch events via API...");
      try {
        const fetchedEventos = await getEventosApi(); // Calls the updated API function
        console.log(`AgendaSection: Fetched ${fetchedEventos.length} events successfully.`);
        setEventos(fetchedEventos);
      } catch (fetchError: any) {
        const errorMessage = fetchError.message || "Erro desconhecido ao buscar eventos.";
        console.error("AgendaSection: Error fetching events:", errorMessage);
        setError(errorMessage); // Set the specific error message from API handler
      } finally {
        setLoading(false);
      }
    }, []); // Empty dependency array means this function is created once

  React.useEffect(() => {
    fetchEventos();
  }, [fetchEventos]); // Depend on the memoized fetch function

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
     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
       {[...Array(3)].map((_, i) => (
         // Simple placeholder div - Use Tailwind classes directly
         <div key={`skeleton-${i}`} className="h-28 w-full rounded-lg bg-muted/60 animate-pulse border p-4 shadow-sm"></div>
       ))}
     </div>
   );

   // Error Display Component
   const ErrorDisplay = ({ errorMsg, onRetry }: { errorMsg: string; onRetry: () => void }) => (
      <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive">
         <AlertCircle className="h-10 w-10 mb-3" />
         <p className="font-semibold">Erro ao Carregar Agenda</p>
         {/* Display the specific error message */}
         <p className="text-sm">{errorMsg}</p>
         <Button onClick={onRetry} variant="destructive" size="sm" className="mt-4">
             Tentar Novamente
         </Button>
       </div>
   );

   // Empty State Component
   const EmptyState = () => (
     <p className="text-center text-muted-foreground mt-10">Nenhum evento futuro agendado no momento.</p>
   );


  return (
    // Added scroll-mt-16 to account for sticky header height
    <section id="agenda-section" className="py-12 px-4 bg-background scroll-mt-16">
       <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-2">Agenda de Eventos</h2>
        <p className="text-muted-foreground text-center mb-8">Futebol feminino: força e cultura.</p>

        {loading ? <LoadingSkeleton /> :
         error ? <ErrorDisplay errorMsg={error} onRetry={fetchEventos} /> :
         eventos.length === 0 ? <EmptyState /> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {eventos.map((evento: Evento, index: number) => (
              <motion.div
                 key={evento.id || index} // Use ID if available, fallback to index
                 custom={index}
                 initial="hidden"
                 animate="visible"
                 variants={cardVariants}
                 className="w-full"
              >
                <Card className="shadow-lg rounded-lg overflow-hidden border border-border bg-card hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-3 pt-4 px-4">
                    {/* Use h3 for semantic structure within the card */}
                    <CardTitle id="h3" className="text-primary text-xl font-semibold">{evento.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2 text-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{evento.data}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{evento.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{evento.local}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
       </div>
    </section>
  );
}

// --- Main Page Component ---
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure takes full height */}
      <HeroSection />
      <ApresentacaoSection />
      <LocaisSection />
      {/* Wrap AgendaSection in a div that can grow */}
      <div className="flex-grow">
        <AgendaSection />
      </div>
    </div>
  );
}
