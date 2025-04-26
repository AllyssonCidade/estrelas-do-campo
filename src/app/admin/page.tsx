
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    getAllEventosCMSApi, addEventoApi, updateEventoApi, deleteEventoApi,
    getAllNoticiasCMSApi, addNoticiaApi, updateNoticiaApi, deleteNoticiaApi // Import Noticia API functions
} from '@/lib/api';
import type { Evento, Noticia } from '@/lib/types'; // Import Noticia type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea for Noticia text
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, PlusCircle, Edit, Trash2, LogOut, Loader2, Newspaper, Image as ImageIcon, Clock, MapPin, AlertCircle } from 'lucide-react'; // Added Newspaper, ImageIcon
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { format, parse, isValid } from 'date-fns';
import { isValidUrl } from '@/lib/validation'; // Import URL validation helper


// --- Admin Login Component ---
// (Keep existing AdminLogin component as is)
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: (password: string) => void }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  // Use environment variable for password check
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "estrelas123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simple password check
    if (password === correctPassword) {
       // Store password temporarily in parent state for API calls
       onLoginSuccess(password);
    } else {
      setError('Senha incorreta.');
    }
    setLoading(false); // Stop loading indicator
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Acesso Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite a senha"
                aria-describedby={error ? "password-error" : undefined}
              />
               {error && <p id="password-error" className="text-sm text-destructive">{error}</p>}
            </div>
             <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper: Parse Date String ---
const parseDateString = (dateStr: string | undefined): Date | undefined => {
  if (!dateStr) return undefined;
  try {
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
  } catch {
    return undefined;
  }
};

// --- Event Form Component ---
// (Keep existing EventForm component mostly as is, minor validation tweaks if needed)
type EventFormProps = {
  evento?: Evento | null;
  onSave: (eventoData: Omit<Evento, 'id'> | Evento, password: string) => Promise<void>; // Add password param
  onCancel: () => void;
  isSaving: boolean;
  adminPassword?: string | null; // Pass password down
};

function EventForm({ evento, onSave, onCancel, isSaving, adminPassword }: EventFormProps) {
  const [titulo, setTitulo] = React.useState(evento?.titulo || '');
  const [data, setData] = React.useState<Date | undefined>(parseDateString(evento?.data));
  const [horario, setHorario] = React.useState(evento?.horario || '');
  const [local, setLocal] = React.useState(evento?.local || '');
  const [formError, setFormError] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
      setTitulo(evento?.titulo || '');
      setData(parseDateString(evento?.data));
      setHorario(evento?.horario || '');
      setLocal(evento?.local || '');
      setFormError('');
  }, [evento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!adminPassword) {
        setFormError('Erro de autenticação. Faça login novamente.');
        return;
    }

    if (!titulo || !data || !horario || !local) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    if (titulo.length > 100) {
        setFormError('Título não pode exceder 100 caracteres.');
        return;
    }
    if (local.length > 100) {
        setFormError('Local não pode exceder 100 caracteres.');
        return;
    }
    if (!/^\d{2}:\d{2}$/.test(horario)) {
      setFormError('Formato de horário inválido. Use HH:MM (ex: 16:00).');
      return;
    }

    const formattedDate = format(data, 'dd/MM/yyyy');
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formattedDate) || !parseDateString(formattedDate)) {
        setFormError('Data inválida selecionada.'); // Should not happen with calendar, but good practice
        return;
    }

    const eventoData: Omit<Evento, 'id'> | Evento = {
      ...(evento && { id: evento.id }),
      titulo,
      data: formattedDate,
      horario,
      local,
    };

    try {
        await onSave(eventoData, adminPassword); // Pass password to the save handler
    } catch (error: any) {
        setFormError(error.message || "Erro ao salvar. Tente novamente.");
        toast({ variant: "destructive", title: "Erro", description: error.message });
    }
  };

  return (
     <Card className="mb-6">
       <CardHeader>
        <CardTitle>{evento ? 'Editar Evento' : 'Adicionar Novo Evento'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
         <CardContent className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-1">
                <Label htmlFor="ev-titulo">Título</Label>
                <Input id="ev-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} required aria-required="true" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="ev-data">Data (DD/MM/YYYY)</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!data && "text-muted-foreground"}`}
                            id="ev-data"
                            aria-required="true"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {data instanceof Date && isValid(data) ? format(data, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={data} onSelect={setData} initialFocus />
                        </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="ev-horario">Horário (HH:MM)</Label>
                    <Input id="ev-horario" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="16:00" pattern="\d{2}:\d{2}" required aria-required="true" />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="ev-local">Local</Label>
                <Input id="ev-local" value={local} onChange={(e) => setLocal(e.target.value)} maxLength={100} required aria-required="true" />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {evento ? 'Salvar Alterações' : 'Adicionar Evento'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


// --- Noticia Form Component ---
type NoticiaFormProps = {
  noticia?: Noticia | null;
  onSave: (noticiaData: Omit<Noticia, 'id'> | Noticia, password: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  adminPassword?: string | null; // Pass password down
};

function NoticiaForm({ noticia, onSave, onCancel, isSaving, adminPassword }: NoticiaFormProps) {
  const [titulo, setTitulo] = React.useState(noticia?.titulo || '');
  const [texto, setTexto] = React.useState(noticia?.texto || '');
  const [imagem, setImagem] = React.useState(noticia?.imagem || '');
  const [data, setData] = React.useState<Date | undefined>(parseDateString(noticia?.data));
  const [formError, setFormError] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
      setTitulo(noticia?.titulo || '');
      setTexto(noticia?.texto || '');
      setImagem(noticia?.imagem || '');
      setData(parseDateString(noticia?.data));
      setFormError('');
  }, [noticia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

     if (!adminPassword) {
        setFormError('Erro de autenticação. Faça login novamente.');
        return;
    }

    if (!titulo || !texto || !imagem || !data) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    if (titulo.length > 100) {
        setFormError('Título não pode exceder 100 caracteres.');
        return;
    }
     if (!isValidUrl(imagem)) {
      setFormError('URL da imagem inválida. Use o formato https://...');
      return;
    }

     const formattedDate = format(data, 'dd/MM/yyyy');
     if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formattedDate) || !parseDateString(formattedDate)) {
        setFormError('Data inválida selecionada.');
        return;
    }


    const noticiaData: Omit<Noticia, 'id'> | Noticia = {
      ...(noticia && { id: noticia.id }),
      titulo,
      texto,
      imagem,
      data: formattedDate,
    };

    try {
      await onSave(noticiaData, adminPassword); // Pass password to the handler
    } catch (error: any) {
      setFormError(error.message || "Erro ao salvar notícia. Tente novamente.");
      toast({ variant: "destructive", title: "Erro", description: error.message });
    }
  };

  return (
    <Card className="mb-6">
       <CardHeader>
        <CardTitle>{noticia ? 'Editar Notícia' : 'Adicionar Nova Notícia'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
         <CardContent className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-1">
                <Label htmlFor="nt-titulo">Título</Label>
                <Input id="nt-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} required aria-required="true" />
            </div>
            <div className="space-y-1">
                <Label htmlFor="nt-texto">Texto</Label>
                <Textarea id="nt-texto" value={texto} onChange={(e) => setTexto(e.target.value)} required aria-required="true" rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="nt-imagem">URL da Imagem</Label>
                    <Input id="nt-imagem" type="url" value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="https://..." required aria-required="true" />
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="nt-data">Data (DD/MM/YYYY)</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!data && "text-muted-foreground"}`}
                            id="nt-data"
                            aria-required="true"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {data instanceof Date && isValid(data) ? format(data, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={data} onSelect={setData} initialFocus />
                        </PopoverContent>
                    </Popover>
                 </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {noticia ? 'Salvar Alterações' : 'Adicionar Notícia'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


// --- Admin Dashboard Component ---
function AdminDashboard({ adminPassword, onLogout }: { adminPassword: string, onLogout: () => void }) {
  const router = useRouter();
  const { toast } = useToast();

  // State for Eventos
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = React.useState(true);
  const [isEventFormOpen, setIsEventFormOpen] = React.useState(false);
  const [editingEvento, setEditingEvento] = React.useState<Evento | null>(null);
  const [isSavingEvento, setIsSavingEvento] = React.useState(false);
  const [deletingEventoId, setDeletingEventoId] = React.useState<number | string | null>(null);
  const [errorEventos, setErrorEventos] = React.useState<string | null>(null);

   // State for Noticias
  const [noticias, setNoticias] = React.useState<Noticia[]>([]);
  const [loadingNoticias, setLoadingNoticias] = React.useState(true);
  const [isNoticiaFormOpen, setIsNoticiaFormOpen] = React.useState(false);
  const [editingNoticia, setEditingNoticia] = React.useState<Noticia | null>(null);
  const [isSavingNoticia, setIsSavingNoticia] = React.useState(false);
  const [deletingNoticiaId, setDeletingNoticiaId] = React.useState<number | string | null>(null);
  const [errorNoticias, setErrorNoticias] = React.useState<string | null>(null);

  // Fetch Data
  const fetchEventos = async () => {
    setLoadingEventos(true);
    setErrorEventos(null);
    try {
      const data = await getAllEventosCMSApi();
      setEventos(data);
    } catch (error: any) {
       setErrorEventos(error.message || "Não foi possível carregar os eventos.");
       toast({ variant: "destructive", title: "Erro ao Carregar Eventos", description: error.message });
    } finally {
      setLoadingEventos(false);
    }
  };

   const fetchNoticias = async () => {
    setLoadingNoticias(true);
    setErrorNoticias(null);
    try {
      const data = await getAllNoticiasCMSApi();
      setNoticias(data);
    } catch (error: any) {
       setErrorNoticias(error.message || "Não foi possível carregar as notícias.");
       toast({ variant: "destructive", title: "Erro ao Carregar Notícias", description: error.message });
    } finally {
      setLoadingNoticias(false);
    }
  };

  React.useEffect(() => {
    fetchEventos();
    fetchNoticias();
  }, []);

  // --- Event Handlers ---
  const handleLogout = () => {
    onLogout();
    router.push('/');
  };

  // Event Handlers
  const handleAddNewEvento = () => { setEditingEvento(null); setIsEventFormOpen(true); };
  const handleEditEvento = (evento: Evento) => { setEditingEvento(evento); setIsEventFormOpen(true); };
  const handleDeleteEvento = async (id: number | string) => {
    setDeletingEventoId(id);
    try {
      await deleteEventoApi(id, adminPassword);
      toast({ title: "Sucesso", description: "Evento deletado." });
      fetchEventos();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Deletar Evento", description: error.message });
    } finally {
      setDeletingEventoId(null);
    }
  };
  const handleSaveEvento = async (eventoData: Omit<Evento, 'id'> | Evento, password: string) => {
    setIsSavingEvento(true);
    try {
       const dataToSend: Omit<Evento, 'id'> = { // Ensure only required fields are sent
          titulo: eventoData.titulo,
          data: eventoData.data,
          horario: eventoData.horario,
          local: eventoData.local,
       };

      if ('id' in eventoData && eventoData.id) {
        await updateEventoApi(eventoData.id, dataToSend, password);
        toast({ title: "Sucesso", description: "Evento atualizado." });
      } else {
        await addEventoApi(dataToSend, password);
        toast({ title: "Sucesso", description: "Evento adicionado." });
      }
      setIsEventFormOpen(false);
      setEditingEvento(null);
      fetchEventos();
    } catch (error: any) {
       toast({ variant: "destructive", title: "Erro ao Salvar Evento", description: error.message });
       throw error; // Re-throw to be caught by form if needed
    } finally {
      setIsSavingEvento(false);
    }
  };

  // Noticia Handlers
  const handleAddNewNoticia = () => { setEditingNoticia(null); setIsNoticiaFormOpen(true); };
  const handleEditNoticia = (noticia: Noticia) => { setEditingNoticia(noticia); setIsNoticiaFormOpen(true); };
  const handleDeleteNoticia = async (id: number | string) => {
    setDeletingNoticiaId(id);
    try {
      await deleteNoticiaApi(id, adminPassword);
      toast({ title: "Sucesso", description: "Notícia deletada." });
      fetchNoticias();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Deletar Notícia", description: error.message });
    } finally {
      setDeletingNoticiaId(null);
    }
  };
 const handleSaveNoticia = async (noticiaData: Omit<Noticia, 'id'> | Noticia, password: string) => {
    setIsSavingNoticia(true);
    try {
        const dataToSend: Omit<Noticia, 'id'> = { // Ensure only required fields are sent
            titulo: noticiaData.titulo,
            texto: noticiaData.texto,
            imagem: noticiaData.imagem,
            data: noticiaData.data,
        };

        if ('id' in noticiaData && noticiaData.id) {
            await updateNoticiaApi(noticiaData.id, dataToSend, password);
            toast({ title: "Sucesso", description: "Notícia atualizada." });
        } else {
            await addNoticiaApi(dataToSend, password);
            toast({ title: "Sucesso", description: "Notícia adicionada." });
        }
        setIsNoticiaFormOpen(false);
        setEditingNoticia(null);
        fetchNoticias();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro ao Salvar Notícia", description: error.message });
        throw error; // Re-throw to be caught by form if needed
    } finally {
        setIsSavingNoticia(false);
    }
};

   // --- Loading/Error Display ---
   const renderLoadingState = (count = 3) => (
     <div className="space-y-3">
       {[...Array(count)].map((_, i) => (
         <div key={i} className="h-24 w-full rounded-lg bg-muted/50 animate-pulse p-4 flex justify-between items-center border">
           <div className="space-y-2 flex-grow mr-4">
             <div className="h-5 w-3/4 bg-muted rounded"></div>
             <div className="h-4 w-1/2 bg-muted rounded"></div>
             <div className="h-4 w-1/3 bg-muted rounded"></div>
           </div>
           <div className="flex gap-2">
             <div className="h-9 w-9 bg-muted rounded"></div>
             <div className="h-9 w-9 bg-muted rounded"></div>
           </div>
         </div>
       ))}
     </div>
   );

   const renderErrorState = (errorMsg: string | null, retryFn: () => void, title: string) => (
      errorMsg && (
          <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 p-6 rounded-lg border border-destructive">
              <AlertCircle className="h-10 w-10 mb-3" />
              <p className="font-semibold">Erro ao Carregar {title}</p>
              <p className="text-sm">{errorMsg}</p>
              <Button onClick={retryFn} variant="destructive" size="sm" className="mt-4">
                  Tentar Novamente
              </Button>
          </div>
      )
   );


  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
         <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Sair
         </Button>
      </div>

        <Tabs defaultValue="eventos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="eventos">Gerenciar Eventos</TabsTrigger>
                <TabsTrigger value="noticias">Gerenciar Notícias</TabsTrigger>
            </TabsList>

            {/* Eventos Tab */}
            <TabsContent value="eventos">
                 <h2 className="text-2xl font-semibold text-primary mb-4">Eventos</h2>
                {isEventFormOpen ? (
                    <EventForm
                    evento={editingEvento}
                    onSave={handleSaveEvento}
                    onCancel={() => { setIsEventFormOpen(false); setEditingEvento(null); }}
                    isSaving={isSavingEvento}
                    adminPassword={adminPassword} // Pass password
                    />
                ) : (
                    <Button onClick={handleAddNewEvento} className="mb-6 bg-primary hover:bg-primary/90" aria-label="Adicionar novo evento">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Evento
                    </Button>
                )}

                <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-semibold">Eventos Cadastrados</h3>
                     {loadingEventos ? renderLoadingState() :
                      errorEventos ? renderErrorState(errorEventos, fetchEventos, "Eventos") :
                      eventos.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
                    ) : (
                    eventos.map((evento) => (
                        <Card key={evento.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-card border shadow-sm">
                        <div className="flex-grow space-y-1">
                            <p className="font-semibold text-primary">{evento.titulo}</p>
                            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                <span className="inline-flex items-center"><CalendarIcon className="h-3 w-3 mr-1"/> {evento.data}</span>
                                <span className="inline-flex items-center"><Clock className="h-3 w-3 mr-1"/> {evento.horario}</span>
                                <span className="inline-flex items-center"><MapPin className="h-3 w-3 mr-1"/> {evento.local}</span>
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
                             <Button variant="outline" size="sm" onClick={() => handleEditEvento(evento)} aria-label={`Editar evento ${evento.titulo}`} disabled={!!deletingEventoId}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" aria-label={`Excluir evento ${evento.titulo}`} disabled={deletingEventoId === evento.id}>
                                        {deletingEventoId === evento.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir o evento "{evento.titulo}"? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel disabled={!!deletingEventoId}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEvento(evento.id)} className="bg-destructive hover:bg-destructive/90" disabled={!!deletingEventoId}>
                                         {deletingEventoId === evento.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Excluir
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        </Card>
                    ))
                    )}
                </div>
            </TabsContent>

            {/* Noticias Tab */}
            <TabsContent value="noticias">
                <h2 className="text-2xl font-semibold text-primary mb-4">Notícias</h2>
                 {isNoticiaFormOpen ? (
                    <NoticiaForm
                        noticia={editingNoticia}
                        onSave={handleSaveNoticia}
                        onCancel={() => { setIsNoticiaFormOpen(false); setEditingNoticia(null); }}
                        isSaving={isSavingNoticia}
                        adminPassword={adminPassword} // Pass password
                    />
                 ) : (
                     <Button onClick={handleAddNewNoticia} className="mb-6 bg-primary hover:bg-primary/90" aria-label="Adicionar nova notícia">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Notícia
                    </Button>
                 )}

                 <div className="mt-8 space-y-4">
                     <h3 className="text-xl font-semibold">Notícias Cadastradas</h3>
                      {loadingNoticias ? renderLoadingState() :
                       errorNoticias ? renderErrorState(errorNoticias, fetchNoticias, "Notícias") :
                       noticias.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma notícia cadastrada.</p>
                    ) : (
                       noticias.map((noticia) => (
                        <Card key={noticia.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-card border shadow-sm">
                            {/* Image Thumbnail */}
                            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative rounded overflow-hidden border bg-muted">
                                <img
                                    src={noticia.imagem || "https://via.placeholder.com/100/cccccc/000000?text=Sem+Imagem"}
                                    alt={`Imagem para ${noticia.titulo}`}
                                    className="w-full h-full object-cover"
                                    // Consider adding error handling for images if needed
                                    // onError={(e) => e.currentTarget.src = 'fallback-image-url'}
                                />
                            </div>
                            {/* Content */}
                            <div className="flex-grow space-y-1">
                                <p className="font-semibold text-primary">{noticia.titulo}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{noticia.texto}</p> {/* Limit text lines */}
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1"/> {noticia.data}
                                </p>
                            </div>
                            {/* Actions */}
                             <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
                                <Button variant="outline" size="sm" onClick={() => handleEditNoticia(noticia)} aria-label={`Editar notícia ${noticia.titulo}`} disabled={!!deletingNoticiaId}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="sm" aria-label={`Excluir notícia ${noticia.titulo}`} disabled={deletingNoticiaId === noticia.id}>
                                            {deletingNoticiaId === noticia.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir a notícia "{noticia.titulo}"? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={!!deletingNoticiaId}>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteNoticia(noticia.id)} className="bg-destructive hover:bg-destructive/90" disabled={!!deletingNoticiaId}>
                                                {deletingNoticiaId === noticia.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Excluir
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             </div>
                        </Card>
                    ))
                    )}
                 </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}


// --- Main Admin Page Component ---
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true); // General loading for the page logic

  // Callback for successful login
  const handleLoginSuccess = (password: string) => {
      setAdminPassword(password);
      setIsAuthenticated(true);
       sessionStorage.setItem('estrelas_admin_loggedin', 'true');
       sessionStorage.setItem('estrelas_admin_pwd', password); // Store password (use more secure method in production)
  };

   // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword(null);
    sessionStorage.removeItem('estrelas_admin_loggedin');
    sessionStorage.removeItem('estrelas_admin_pwd');
  };

   // Check session storage on mount
   React.useEffect(() => {
      setLoading(true);
      const loggedIn = sessionStorage.getItem('estrelas_admin_loggedin') === 'true';
      const storedPassword = sessionStorage.getItem('estrelas_admin_pwd');
      if (loggedIn && storedPassword) {
          // Optionally, verify password against env var again here for extra safety
          const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "estrelas123";
          if (storedPassword === correctPassword) {
            setIsAuthenticated(true);
            setAdminPassword(storedPassword);
          } else {
              // Clear invalid session storage if password doesn't match env var
              handleLogout();
          }
      }
      setLoading(false);
   }, []);


  if (loading) {
      // Basic full page loader while checking session
      return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated || !adminPassword) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, show dashboard
  return <AdminDashboard adminPassword={adminPassword} onLogout={handleLogout} />;
}

    