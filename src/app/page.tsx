
'use client'; // Mark as client component for hooks and animations

import * as React from 'react'; // Import React for useEffect/useState
import { getEventosApi } from '@/lib/api'; // Import API function
import type { Evento } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Map, Building, Loader2, AlertCircle } from 'lucide-react'; // Added Loader2, AlertCircle
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import motion for animations

// --- Hero Section ---
function HeroSection() {
  return (
     // Updated section with background image, overlay, and specific heights
    <section className="relative bg-cover bg-center text-white py-16 sm:py-24 px-4 text-center overflow-hidden h-[250px] sm:h-[350px] flex flex-col items-center justify-center"
             style={{
                 backgroundImage: "url('https://image.pollinations.ai/prompt/Illustration%20soccer%20ball%20on%20green%20field%20at%20sunset%2C%20warm%20golden%20sky%2C%20vibrant%20green%20grass%2C%20horizontal%2C%20semi-realistic%20style')",
                 backgroundSize: "cover",
                 backgroundPosition: "center"
            }}> {/* Changed to center position */}
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div> {/* Adjusted opacity */}

      {/* Content wrapper */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h1
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-4xl sm:text-5xl font-bold mb-4 text-accent" // Use theme's accent color (gold)
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }} // Adjusted shadow for gold text
        >
          Estrelas do Campo
        </motion.h1>
         <motion.h2
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="text-xl sm:text-2xl font-semibold mb-4 text-white" // Secondary title remains white
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}
        >
          Força, Cultura e Inclusão
        </motion.h2>
        <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="text-base sm:text-lg mb-8 text-white" // Ensure white text
        >
          Apoie o futebol feminino e junte-se à nossa comunidade!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            // Use the accent variant for gold, hover defined in button component
            variant="accent" // Use accent variant for gold background
            className="font-semibold shadow-md transition-colors duration-200 hover:bg-yellow-500 text-accent-foreground" // Explicit hover and text color
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior if needed
              const agendaSection = document.getElementById('agenda-section');
              if (agendaSection) {
                agendaSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="Ir para a seção da agenda" // Added aria-label
          >
            <a href="#agenda-section">Ver Agenda</a>
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.4 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4">
               {/* Using via.placeholder directly */}
               <Image
                  src="https://via.placeholder.com/300x200/22C55E/FFFFFF?text=Futebol+Feminino"
                  alt="Time de futebol feminino celebrando união"
                  width={300}
                  height={200}
                  layout="responsive"
                  className="transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  unoptimized // Placeholders don't need optimization
                />
            </div>
            <p className="text-accent font-semibold text-sm">Juntas, somos imbatíveis!</p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.6 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4">
               {/* Using via.placeholder directly */}
               <Image
                  src="https://via.placeholder.com/300x200/FBBF24/1F2937?text=Jogadora"
                  alt="Jogadora de futebol chutando a bola com energia"
                  width={300}
                  height={200}
                  layout="responsive"
                  className="transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  unoptimized // Placeholders don't need optimization
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
      endereco: "Rua do Esporte, 123, Cidade",
      descricao: "Nosso lar para treinos e jogos!",
      imagem: "https://via.placeholder.com/300x150/cccccc/000000?text=Campo+Municipal", // Placeholder image
      alt: "Imagem do Campo Municipal",
      icon: <Map className="h-6 w-6 text-primary" />
    },
    {
      nome: "Estádio Central",
      endereco: "Av. Central, 456, Cidade",
      descricao: "Palco dos grandes amistosos!",
      imagem: "https://via.placeholder.com/300x150/cccccc/000000?text=Est%C3%A1dio+Central", // Placeholder image
      alt: "Imagem do Estádio Central",
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
              <Card className="overflow-hidden shadow-lg rounded-lg h-full flex flex-col text-left bg-card">
                <div className="relative h-40 w-full">
                   {/* Using via.placeholder */}
                   <Image
                      src={local.imagem}
                      alt={local.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      loading="lazy" // Lazy load images in Locais section
                      unoptimized // Placeholder images don't need optimization
                    />
                </div>
                <CardHeader className="flex-row items-center gap-3 pb-2 pt-4 px-4"> {/* Adjusted padding */}
                  {local.icon}
                  <CardTitle className="text-xl text-primary">{local.nome}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-1 px-4 pb-4"> {/* Adjusted padding */}
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
  const [error, setError] = React.useState<string | null>(null); // State to hold error message

  const fetchEventos = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        // Fetch from API
        console.log("Attempting to fetch events..."); // Added log
        const fetchedEventos = await getEventosApi();
        console.log("Fetched events:", fetchedEventos); // Added log
        setEventos(fetchedEventos);
      } catch (error: any) {
        console.error("Error caught in fetchEventos:", error); // Log the caught error object
        // Use the error message thrown by getEventosApi
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao buscar eventos.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

  React.useEffect(() => {
    fetchEventos();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger animation
        duration: 0.2, // Faster fade-in as requested
      },
    }),
  };


  return (
    <section id="agenda-section" className="py-12 px-4 bg-background">
       <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-2">Agenda de Eventos</h2>
        <p className="text-muted-foreground text-center mb-8">Futebol feminino: força e cultura.</p>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {[...Array(3)].map((_, i) => ( // Show 3 placeholders using simple divs
                <div key={`skeleton-${i}`} className="shadow-md rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse">
                    <div className="h-6 w-3/4 bg-muted rounded"></div> {/* Skeleton Title */}
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div> {/* Icon Skel */}
                        <div className="h-4 w-1/2 bg-muted rounded"></div> {/* Date Skel */}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div> {/* Icon Skel */}
                        <div className="h-4 w-1/3 bg-muted rounded"></div> {/* Time Skel */}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div> {/* Icon Skel */}
                        <div className="h-4 w-2/3 bg-muted rounded"></div> {/* Location Skel */}
                    </div>
                </div>
            ))}
          </div>
        ) : error ? ( // Display error message if fetch failed
          <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-semibold">Erro ao Carregar Agenda</p>
            {/* Display the specific error message from the state */}
            <p className="text-sm">{error}</p>
            <Button onClick={fetchEventos} variant="destructive" size="sm" className="mt-4">
                Tentar Novamente
            </Button>
          </div>
        ) : eventos.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">Nenhum evento futuro agendado no momento.</p> // Updated message
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {eventos.map((evento: Evento, index: number) => (
              <motion.div
                 key={evento.id}
                 custom={index}
                 initial="hidden"
                 animate="visible"
                 variants={cardVariants}
                 className="w-full" // Ensure motion div takes full width
              >
                <Card className="shadow-lg rounded-lg overflow-hidden border border-border bg-card hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-primary text-xl font-semibold">{evento.titulo}</CardTitle>
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
    <div className="flex flex-col">
      <HeroSection />
      <ApresentacaoSection />
      <LocaisSection />
      <AgendaSection />
    </div>
  );
}
