
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ContatoPage() {
  // Use placeholder number as requested
  const whatsappNumber = "5571997248724";
  const whatsappMessage = "Olá, sou fã do Estrelas do Campo e quero saber mais!";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-[calc(100vh-14rem)] py-8 px-4"> {/* Added padding */}
      <MessageCircle className="h-16 w-16 text-accent" /> {/* Using accent color (gold) */}
      <h1 className="text-2xl font-bold text-primary">Fale com as Estrelas do Campo!</h1>
      <p className="text-muted-foreground max-w-md"> {/* Removed px-4 as parent has it */}
        Tem alguma dúvida, sugestão ou quer apoiar o time? Entre em contato conosco diretamente pelo WhatsApp. Estamos ansiosas para ouvir você!
      </p>
      <Button
        asChild
        size="lg"
        variant="accent" // Use accent variant for gold background
        className="text-accent-foreground font-semibold shadow-md transition-colors duration-200 hover:bg-yellow-500" // Use specific darker gold on hover
        aria-label="Enviar mensagem via WhatsApp" // Added aria-label
      >
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Enviar Mensagem via WhatsApp
        </Link>
      </Button>
    </div>
  );
}
