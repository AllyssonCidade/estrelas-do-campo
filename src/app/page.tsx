
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
    <section className="relative bg-cover bg-center text-white py-16 sm:py-24 px-4 text-center overflow-hidden h-[250px] sm:h-[350px] flex flex-col items-center justify-center"
             style={{
                 // Use a placeholder image if the actual one isn't available or causes issues
                 // backgroundImage: "url('https://image.pollinations.ai/prompt/Illustration%20soccer%20ball%20on%20green%20field%20at%20sunset%2C%20warm%20golden%20sky%2C%20vibrant%20green%20grass%2C%20horizontal%2C%20semi-realistic%20style')",
                 backgroundImage: "url('https://videos.openai.com/vg-assets/assets%2Ftask_01jss3fs1rfcqaca6f80bpj9b2%2F1745673059_img_0.webp?st=2025-04-26T18%3A20%3A00Z&se=2025-05-02T19%3A20%3A00Z&sks=b&skt=2025-04-26T18%3A20%3A00Z&ske=2025-05-02T19%3A20%3A00Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=ItnqDVEMwgHNNHESNCL9lWepdKK%2BpQqOfxUeXTW1gGM%3D&az=oaivgprodscus')",
                 backgroundSize: "cover",
                 backgroundPosition: "bottom",
            }}>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Content wrapper */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h1
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-4xl sm:text-5xl font-bold mb-4 text-accent" // Gold text
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
        >
          Estrelas do Campo
        </motion.h1>
         <motion.h2
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="text-xl sm:text-2xl font-semibold mb-4 text-white"
           style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}
        >
          Força, Cultura e Inclusão
        </motion.h2>
        <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="text-base sm:text-lg mb-8 text-white"
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
            variant="accent" // Gold background
            className="font-semibold shadow-md transition-colors duration-200 hover:bg-yellow-500 text-accent-foreground"
            onClick={(e) => {
              e.preventDefault();
              const agendaSection = document.getElementById('agenda-section');
              if (agendaSection) {
                agendaSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="Ir para a seção da agenda"
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
          {/* Image 1 */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.4 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4 relative aspect-[3/2]">
               <Image
                  src="https://videos.openai.com/vg-assets/assets%2Ftask_01jss2fn50fert2678jpc003k7%2F1745672019_img_0.webp?st=2025-04-26T18%3A20%3A00Z&se=2025-05-02T19%3A20%3A00Z&sks=b&skt=2025-04-26T18%3A20%3A00Z&ske=2025-05-02T19%3A20%3A00Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=qE9fpdSTKzt4nRejRdCd%2FNR7%2BQw4RCk5qwpE1ZNqTpc%3D&az=oaivgprodscus"
                  alt="Time de futebol feminino celebrando união com uniforme verde"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  unoptimized // Placeholder
                />
            </div>
            <p className="text-accent font-semibold text-sm">Juntas, somos imbatíveis!</p>
          </motion.div>
           {/* Image 2 */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ ...itemVariants, visible: { ...itemVariants.visible, transition: { ...itemVariants.visible.transition, delay: 0.6 } } }}>
            <div className="overflow-hidden rounded-lg shadow-md mb-4 relative aspect-[3/2]">
               <Image
                  src="https://videos.openai.com/vg-assets/assets%2Ftask_01jsy1aas3em4a1d1d5w5j6sxt%2F1745838570_img_0.webp?st=2025-04-28T09%3A45%3A14Z&se=2025-05-04T10%3A45%3A14Z&sks=b&skt=2025-04-28T09%3A45%3A14Z&ske=2025-05-04T10%3A45%3A14Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=2v2GYwEgOpQU18uVpIrIv3bqf2xeqKZDpCIIhw1tT6Q%3D&az=oaivgprodscus"
                  alt="Time de futebol feminino celebrando união com uniforme azul"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  unoptimized // Placeholder
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
      imagem: "https://tse4.mm.bing.net/th?id=OIP.fPG8YU27Gh7iH1op7PA97gHaFj&pid=Api&P=0&h=180", // Placeholder image
      alt: "Imagem do Campo Municipal",
      icon: <Map className="h-6 w-6 text-primary" />
    },
    {
      nome: "Estádio Central",
      endereco: "Av. Central, 456, Cidade",
      descricao: "Palco dos grandes amistosos!",
      imagem: "https://tse4.mm.bing.net/th?id=OIP.1Drqxt9sjAefZ0K9lM2GgQHaFj&pid=Api&P=0&h=180", // Placeholder image
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
              <Card className="overflow-hidden shadow-lg rounded-lg h-full flex flex-col text-left bg-card border">
                <div className="relative h-40 w-full bg-muted"> {/* Added bg-muted */}
                   <Image
                      src={local.imagem}
                      alt={local.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      loading="lazy" // Lazy load images in Locais section
                      unoptimized // Placeholder
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
      setError(null);
      try {
        console.log("AgendaSection: Attempting to fetch events...");
        const fetchedEventos = await getEventosApi();
        console.log("AgendaSection: Fetched events successfully:", fetchedEventos.length);
        setEventos(fetchedEventos);
      } catch (fetchError: any) {
        // Use the error message passed from the API handler
        const errorMessage = fetchError instanceof Error ? fetchError.message : "Erro desconhecido ao buscar eventos.";
        console.error("AgendaSection: Error fetching events:", errorMessage);
        setError(errorMessage); // Set the specific error message
      } finally {
        setLoading(false);
      }
    }, []); // Empty dependency array means this function is created once

  React.useEffect(() => {
    fetchEventos();
  }, [fetchEventos]); // Depend on the memoized fetch function

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.2, // Fade-in duration 0.2s
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
            {[...Array(3)].map((_, i) => ( // Show 3 simple placeholders
                <div key={`skeleton-${i}`} className="shadow-md rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse">
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </div>
                </div>
            ))}
          </div>
        ) : error ? ( // Display specific error message
          <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-semibold">Erro ao Carregar Agenda</p>
            <p className="text-sm">{error}</p> {/* Display the fetched error message */}
            <Button onClick={fetchEventos} variant="destructive" size="sm" className="mt-4">
                Tentar Novamente
            </Button>
          </div>
        ) : eventos.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">Nenhum evento futuro agendado no momento.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {eventos.map((evento: Evento, index: number) => (
              <motion.div
                 key={evento.id}
                 custom={index}
                 initial="hidden"
                 animate="visible"
                 variants={cardVariants}
                 className="w-full"
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
