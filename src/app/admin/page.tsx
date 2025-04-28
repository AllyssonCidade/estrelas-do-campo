
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    getAllEventosCMSApi, addEventoApi, updateEventoApi, deleteEventoApi,
    getAllNoticiasCMSApi, addNoticiaApi, updateNoticiaApi, deleteNoticiaApi
} from '@/lib/api'; // Assuming api.ts is updated for Noticias as well
import type { Evento, Noticia } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, PlusCircle, Edit, Trash2, LogOut, Loader2, Newspaper, Image as ImageIcon, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parse, isValid } from 'date-fns';
import { isValidUrl, isValidDateString, isValidTimeString } from '@/lib/validation'; // Import validation helpers

// --- Admin Login Component ---
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: (password: string) => void }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  // Use environment variable for password check (ensure NEXT_PUBLIC_ prefix if used client-side)
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "estrelas123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic check
    if (password === correctPassword) {
       onLoginSuccess(password); // Pass password for API calls
    } else {
      setError('Senha incorreta.');
    }
    setLoading(false);
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

// --- Helper: Parse Date String DD/MM/YYYY to Date object ---
const parseDateString = (dateStr: string | undefined): Date | undefined => {
  if (!dateStr || !isValidDateString(dateStr)) return undefined;
  try {
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
  } catch {
    return undefined;
  }
};

// --- Event Form Component ---
type EventFormProps = {
  evento?: Evento | null;
  onSave: (eventoData: Omit<Evento, 'id'> | Evento, password: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  adminPassword?: string | null; // Receive admin password as prop
};

function EventForm({ evento, onSave, onCancel, isSaving, adminPassword }: EventFormProps) {
  const [titulo, setTitulo] = React.useState(evento?.titulo || '');
  const [data, setData] = React.useState<Date | undefined>(parseDateString(evento?.data));
  const [horario, setHorario] = React.useState(evento?.horario || '');
  const [local, setLocal] = React.useState(evento?.local || '');
  const [formError, setFormError] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
      // Reset form when 'evento' prop changes
      setTitulo(evento?.titulo || '');
      setData(parseDateString(evento?.data));
      setHorario(evento?.horario || '');
      setLocal(evento?.local || '');
      setFormError(''); // Clear previous errors
  }, [evento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!adminPassword) {
        setFormError('Erro de autenticação. Faça login novamente.');
        toast({ variant: "destructive", title: "Erro de Autenticação", description: "Senha de admin não encontrada." });
        return;
    }

    // Client-side Validation
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
    if (!isValidTimeString(horario)) { // Use validation helper
      setFormError('Formato de horário inválido. Use HH:MM (ex: 16:00).');
      return;
    }

    const formattedDate = format(data, 'dd/MM/yyyy');
    if (!isValidDateString(formattedDate)) { // Use validation helper
        setFormError('Data inválida. Use o formato DD/MM/YYYY.');
        return;
    }

    // Prepare data, including id only if updating
    const eventoData: Omit<Evento, 'id'> | Evento = {
      ...(evento?.id && { id: evento.id }), // Include id only if it exists (update)
      titulo,
      data: formattedDate,
      horario,
      local,
    };

    try {
        await onSave(eventoData, adminPassword); // Pass password to API call
        // Success toast/handling is done in the parent component after calling fetchEventos
    } catch (error: any) {
        // Display error from API call
        const apiErrorMessage = error.message || "Erro desconhecido ao salvar evento.";
        setFormError(apiErrorMessage);
        // Optional: Show toast here if parent doesn't always handle it
        // toast({ variant: "destructive", title: "Erro ao Salvar Evento", description: apiErrorMessage });
    }
  };

  return (
     <Card className="mb-6 shadow-md border">
       <CardHeader>
        <CardTitle className="text-primary">{evento?.id ? 'Editar Evento' : 'Adicionar Novo Evento'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
         <CardContent className="space-y-4">
            {formError && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive">{formError}</p>}
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
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar mode="single" selected={data} onSelect={setData} initialFocus />
                        </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="ev-horario">Horário (HH:MM)</Label>
                    <Input id="ev-horario" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="16:00" pattern="\d{2}:\d{2}" title="Use o formato HH:MM" required aria-required="true" />
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
                {evento?.id ? 'Salvar Alterações' : 'Adicionar Evento'}
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
  adminPassword?: string | null; // Receive admin password as prop
};

function NoticiaForm({ noticia, onSave, onCancel, isSaving, adminPassword }: NoticiaFormProps) {
  const [titulo, setTitulo] = React.useState(noticia?.titulo || '');
  const [texto, setTexto] = React.useState(noticia?.texto || '');
  const [imagem, setImagem] = React.useState(noticia?.imagem || '');
  const [data, setData] = React.useState<Date | undefined>(parseDateString(noticia?.data));
  const [formError, setFormError] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
      // Reset form when 'noticia' prop changes
      setTitulo(noticia?.titulo || '');
      setTexto(noticia?.texto || '');
      setImagem(noticia?.imagem || '');
      setData(parseDateString(noticia?.data));
      setFormError(''); // Clear previous errors
  }, [noticia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

     if (!adminPassword) {
        setFormError('Erro de autenticação. Faça login novamente.');
         toast({ variant: "destructive", title: "Erro de Autenticação", description: "Senha de admin não encontrada." });
        return;
    }

    // Client-side Validation
    if (!titulo || !texto || !imagem || !data) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    if (titulo.length > 100) {
        setFormError('Título não pode exceder 100 caracteres.');
        return;
    }
     if (!isValidUrl(imagem)) { // Use validation helper
      setFormError('URL da imagem inválida. Use o formato http:// ou https://...');
      return;
    }
    if (imagem.length > 255) {
        setFormError('URL da imagem não pode exceder 255 caracteres.');
        return;
    }

     const formattedDate = format(data, 'dd/MM/yyyy');
     if (!isValidDateString(formattedDate)) { // Use validation helper
        setFormError('Data inválida. Use o formato DD/MM/YYYY.');
        return;
    }

    // Prepare data, include id only if updating
    const noticiaData: Omit<Noticia, 'id'> | Noticia = {
      ...(noticia?.id && { id: noticia.id }), // Include id only if updating
      titulo,
      texto,
      imagem,
      data: formattedDate,
    };

    try {
      await onSave(noticiaData, adminPassword); // Pass password to API call
      // Success toast/handling done in parent component
    } catch (error: any) {
       const apiErrorMessage = error.message || "Erro desconhecido ao salvar notícia.";
       setFormError(apiErrorMessage);
       // Optional: toast({ variant: "destructive", title: "Erro ao Salvar Notícia", description: apiErrorMessage });
    }
  };

  return (
    <Card className="mb-6 shadow-md border">
       <CardHeader>
        <CardTitle className="text-primary">{noticia?.id ? 'Editar Notícia' : 'Adicionar Nova Notícia'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
         <CardContent className="space-y-4">
            {formError && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive">{formError}</p>}
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
                    <Input id="nt-imagem" type="url" value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="https://..." required aria-required="true" title="Insira uma URL válida começando com http:// ou https://" maxLength={255} />
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
                        <PopoverContent className="w-auto p-0" align="start">
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
                {noticia?.id ? 'Salvar Alterações' : 'Adicionar Notícia'}
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

  // --- Fetch Data ---
  const fetchEventos = React.useCallback(async () => {
    console.log("Admin: Fetching events...");
    setLoadingEventos(true);
    setErrorEventos(null);
    try {
      // Use the CMS API endpoint which fetches all events
      const data = await getAllEventosCMSApi();
      setEventos(data);
       console.log(`Admin: Fetched ${data.length} events.`);
    } catch (error: any) {
       const errorMessage = error.message || "Não foi possível carregar os eventos.";
       setErrorEventos(errorMessage);
       toast({ variant: "destructive", title: "Erro ao Carregar Eventos", description: errorMessage });
       console.error("Admin: Error fetching events:", errorMessage);
    } finally {
      setLoadingEventos(false);
    }
  }, [toast]); // Added toast dependency

   const fetchNoticias = React.useCallback(async () => {
     console.log("Admin: Fetching noticias...");
    setLoadingNoticias(true);
    setErrorNoticias(null);
    try {
      // Use the CMS API endpoint for all noticias
      const data = await getAllNoticiasCMSApi();
      setNoticias(data);
      console.log(`Admin: Fetched ${data.length} noticias.`);
    } catch (error: any) {
       const errorMessage = error.message || "Não foi possível carregar as notícias.";
       setErrorNoticias(errorMessage);
       toast({ variant: "destructive", title: "Erro ao Carregar Notícias", description: errorMessage });
       console.error("Admin: Error fetching noticias:", errorMessage);
    } finally {
      setLoadingNoticias(false);
    }
  }, [toast]); // Added toast dependency

  React.useEffect(() => {
    // Fetch data only if authenticated with a valid password
    if (adminPassword) {
        fetchEventos();
        fetchNoticias();
    } else {
        console.warn("Admin: Attempted to fetch data without password.");
        // Optionally redirect or show an error if password is unexpectedly missing
    }
  }, [adminPassword, fetchEventos, fetchNoticias]); // Rerun if password changes or fetch functions change

  // --- Event Handlers ---
  const handleLogout = () => {
    onLogout(); // Call parent logout handler (clears session storage)
    router.push('/'); // Redirect to home after logout
  };

  // --- Event CRUD Handlers ---
  const handleAddNewEvento = () => { setEditingEvento(null); setIsEventFormOpen(true); };
  const handleEditEvento = (evento: Evento) => { setEditingEvento(evento); setIsEventFormOpen(true); };
  const handleDeleteEvento = async (id: number | string) => {
     if (!adminPassword) {
        toast({ variant: "destructive", title: "Erro de Autenticação", description: "Senha necessária para deletar." });
        return;
    }
    setDeletingEventoId(id);
    try {
      await deleteEventoApi(id, adminPassword); // Pass password
      toast({ title: "Sucesso", description: "Evento deletado." });
      fetchEventos(); // Refresh list
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Deletar Evento", description: error.message });
    } finally {
      setDeletingEventoId(null);
    }
  };
  const handleSaveEvento = async (eventoData: Omit<Evento, 'id'> | Evento, password: string) => {
    setIsSavingEvento(true);
    try {
       // Ensure data is clean before sending
       const dataToSend: Omit<Evento, 'id'> = {
          titulo: eventoData.titulo,
          data: eventoData.data,
          horario: eventoData.horario,
          local: eventoData.local,
       };

      if ('id' in eventoData && eventoData.id) {
        // Update existing event
        await updateEventoApi(eventoData.id, dataToSend, password);
        toast({ title: "Sucesso", description: "Evento atualizado." });
      } else {
        // Add new event
        await addEventoApi(dataToSend, password);
        toast({ title: "Sucesso", description: "Evento adicionado." });
      }
      setIsEventFormOpen(false);
      setEditingEvento(null);
      fetchEventos(); // Refresh list
    } catch (error: any) {
       // Let the form display the error via its state
       console.error("Error saving event in dashboard handler:", error);
       toast({ variant: "destructive", title: "Erro ao Salvar Evento", description: error.message });
       throw error; // Re-throw to signal error to the form
    } finally {
      setIsSavingEvento(false);
    }
  };

  // --- Noticia CRUD Handlers ---
  const handleAddNewNoticia = () => { setEditingNoticia(null); setIsNoticiaFormOpen(true); };
  const handleEditNoticia = (noticia: Noticia) => { setEditingNoticia(noticia); setIsNoticiaFormOpen(true); };
  const handleDeleteNoticia = async (id: number | string) => {
     if (!adminPassword) {
        toast({ variant: "destructive", title: "Erro de Autenticação", description: "Senha necessária para deletar." });
        return;
    }
    setDeletingNoticiaId(id);
    try {
      await deleteNoticiaApi(id, adminPassword); // Pass password
      toast({ title: "Sucesso", description: "Notícia deletada." });
      fetchNoticias(); // Refresh list
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Deletar Notícia", description: error.message });
    } finally {
      setDeletingNoticiaId(null);
    }
  };
 const handleSaveNoticia = async (noticiaData: Omit<Noticia, 'id'> | Noticia, password: string) => {
    setIsSavingNoticia(true);
    try {
        // Ensure clean data
        const dataToSend: Omit<Noticia, 'id'> = {
            titulo: noticiaData.titulo,
            texto: noticiaData.texto,
            imagem: noticiaData.imagem,
            data: noticiaData.data,
        };

        if ('id' in noticiaData && noticiaData.id) {
            // Update existing noticia
            await updateNoticiaApi(noticiaData.id, dataToSend, password);
            toast({ title: "Sucesso", description: "Notícia atualizada." });
        } else {
            // Add new noticia
            await addNoticiaApi(dataToSend, password);
            toast({ title: "Sucesso", description: "Notícia adicionada." });
        }
        setIsNoticiaFormOpen(false);
        setEditingNoticia(null);
        fetchNoticias(); // Refresh list
    } catch (error: any) {
       // Let the form display the error
       console.error("Error saving noticia in dashboard handler:", error);
       toast({ variant: "destructive", title: "Erro ao Salvar Notícia", description: error.message });
       throw error; // Re-throw
    } finally {
        setIsSavingNoticia(false);
    }
};

   // --- Loading/Error Display ---
   const renderLoadingState = (count = 3) => (
     <div className="space-y-3">
       {[...Array(count)].map((_, i) => (
         // Simple placeholder div - Use Tailwind classes directly
         <div key={i} className="h-20 w-full rounded-lg bg-muted/60 animate-pulse border p-4 shadow-sm"></div>
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
       <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
         <Button variant="outline" onClick={handleLogout} size="sm" aria-label="Sair do painel administrativo">
            <LogOut className="mr-2 h-4 w-4" /> Sair
         </Button>
      </div>

        {/* Tabs for Eventos and Noticias */}
        <Tabs defaultValue="eventos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary p-1 rounded-lg">
                <TabsTrigger value="eventos" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">Gerenciar Eventos</TabsTrigger>
                <TabsTrigger value="noticias" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary">Gerenciar Notícias</TabsTrigger>
            </TabsList>

            {/* Eventos Tab */}
            <TabsContent value="eventos">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">Eventos</h2>
                     {/* Show Add button only if form is not open */}
                     {!isEventFormOpen && (
                        <Button onClick={handleAddNewEvento} className="bg-primary hover:bg-primary/90" aria-label="Adicionar novo evento">
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Evento
                        </Button>
                    )}
                 </div>

                {/* Event Form (conditionally rendered) */}
                {isEventFormOpen && (
                    <EventForm
                    evento={editingEvento}
                    onSave={handleSaveEvento}
                    onCancel={() => { setIsEventFormOpen(false); setEditingEvento(null); }}
                    isSaving={isSavingEvento}
                    adminPassword={adminPassword} // Pass the confirmed password
                    />
                )}

                {/* Event List */}
                <div className="mt-6 space-y-4">
                     {loadingEventos ? renderLoadingState() :
                      errorEventos ? renderErrorState(errorEventos, fetchEventos, "Eventos") :
                      eventos.length === 0 && !isEventFormOpen ? ( // Show message only if no form is open
                        <p className="text-center text-muted-foreground py-6">Nenhum evento cadastrado.</p>
                    ) : (
                    eventos.map((evento) => (
                        <Card key={evento.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-card border shadow-sm hover:shadow-md transition-shadow duration-150">
                        <div className="flex-grow space-y-1">
                            <p className="font-semibold text-primary">{evento.titulo}</p>
                            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                <span className="inline-flex items-center"><CalendarIcon className="h-3 w-3 mr-1.5 text-muted-foreground"/> {evento.data}</span>
                                <span className="inline-flex items-center"><Clock className="h-3 w-3 mr-1.5 text-muted-foreground"/> {evento.horario}</span>
                                <span className="inline-flex items-center"><MapPin className="h-3 w-3 mr-1.5 text-muted-foreground"/> {evento.local}</span>
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
                            {/* Edit Button */}
                             <Button variant="outline" size="icon" onClick={() => handleEditEvento(evento)} aria-label={`Editar evento ${evento.titulo}`} disabled={!!deletingEventoId || isEventFormOpen} className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
                            {/* Delete Button */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" aria-label={`Excluir evento ${evento.titulo}`} disabled={deletingEventoId === evento.id || isEventFormOpen} className="h-8 w-8">
                                        {deletingEventoId === evento.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>Tem certeza que deseja excluir o evento "{evento.titulo}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
                                    </AlertDialogHeader>
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
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">Notícias</h2>
                     {/* Show Add button only if form is not open */}
                     {!isNoticiaFormOpen && (
                         <Button onClick={handleAddNewNoticia} className="bg-primary hover:bg-primary/90" aria-label="Adicionar nova notícia">
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Notícia
                        </Button>
                    )}
                 </div>

                 {/* Noticia Form (conditionally rendered) */}
                 {isNoticiaFormOpen && (
                    <NoticiaForm
                        noticia={editingNoticia}
                        onSave={handleSaveNoticia}
                        onCancel={() => { setIsNoticiaFormOpen(false); setEditingNoticia(null); }}
                        isSaving={isSavingNoticia}
                        adminPassword={adminPassword} // Pass the confirmed password
                    />
                 )}

                {/* Noticia List */}
                 <div className="mt-6 space-y-4">
                      {loadingNoticias ? renderLoadingState() :
                       errorNoticias ? renderErrorState(errorNoticias, fetchNoticias, "Notícias") :
                       noticias.length === 0 && !isNoticiaFormOpen ? ( // Show message only if no form is open
                        <p className="text-center text-muted-foreground py-6">Nenhuma notícia cadastrada.</p>
                    ) : (
                       noticias.map((noticia) => (
                        <Card key={noticia.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-card border shadow-sm hover:shadow-md transition-shadow duration-150">
                            {/* Image Thumbnail */}
                            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative rounded overflow-hidden border bg-muted">
                                {/* Use next/image if optimization is needed, otherwise standard img */}
                                <img
                                    src={noticia.imagem || "https://via.placeholder.com/100/e2e8f0/64748b?text=N/A"}
                                    alt={`Imagem para ${noticia.titulo}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy" // Basic lazy loading
                                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/100/fecaca/991b1b?text=Erro"; e.currentTarget.alt = "Erro ao carregar imagem"; }}
                                />
                            </div>
                            {/* Content */}
                            <div className="flex-grow space-y-1">
                                <p className="font-semibold text-primary">{noticia.titulo}</p>
                                <p className="text-sm text-foreground line-clamp-2">{noticia.texto}</p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1.5 text-muted-foreground"/> {noticia.data}
                                </p>
                            </div>
                            {/* Actions */}
                             <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
                                {/* Edit Button */}
                                <Button variant="outline" size="icon" onClick={() => handleEditNoticia(noticia)} aria-label={`Editar notícia ${noticia.titulo}`} disabled={!!deletingNoticiaId || isNoticiaFormOpen} className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                 {/* Delete Button */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="icon" aria-label={`Excluir notícia ${noticia.titulo}`} disabled={deletingNoticiaId === noticia.id || isNoticiaFormOpen} className="h-8 w-8">
                                            {deletingNoticiaId === noticia.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                            <AlertDialogDescription>Tem certeza que deseja excluir a notícia "{noticia.titulo}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
                                        </AlertDialogHeader>
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
  const [loading, setLoading] = React.useState(true); // Initial loading state for checking auth

  // Function to handle successful login
  const handleLoginSuccess = (password: string) => {
      setAdminPassword(password); // Store the confirmed password
      setIsAuthenticated(true);
      try {
        // Use sessionStorage for simplicity to remember login state across refreshes (but not closing browser)
        // NOTE: sessionStorage is cleared when the browser tab is closed. Use localStorage for more persistence.
        sessionStorage.setItem('estrelas_admin_loggedin', 'true');
        sessionStorage.setItem('estrelas_admin_pwd', password); // Store password to re-validate on reload
      } catch (e) {
          console.warn("Session storage is not available. Login state won't persist across page reloads.");
      }
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword(null);
     try {
        sessionStorage.removeItem('estrelas_admin_loggedin');
        sessionStorage.removeItem('estrelas_admin_pwd');
     } catch (e) {
         console.warn("Session storage is not available.");
     }
     // Optionally, redirect to home or login page after logout
     // useRouter().push('/');
  };

   // Check authentication status on component mount
   React.useEffect(() => {
      setLoading(true);
      let loggedIn = false;
      let storedPassword = null;
      try {
          loggedIn = sessionStorage.getItem('estrelas_admin_loggedin') === 'true';
          storedPassword = sessionStorage.getItem('estrelas_admin_pwd');
      } catch (e) {
         console.warn("Session storage is not available. Cannot check persistent login state.");
      }

      // Get the correct password (could be from env var)
      const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "estrelas123";

      // Validate stored credentials
      if (loggedIn && storedPassword && storedPassword === correctPassword) {
          setIsAuthenticated(true);
          setAdminPassword(storedPassword); // Set the password from storage
      } else {
           // If loggedIn state is true but password doesn't match, or no password stored, force logout
           if (loggedIn) {
               handleLogout(); // Clear invalid session state
           }
           setIsAuthenticated(false);
           setAdminPassword(null);
      }
      setLoading(false); // Finished checking auth state
   }, []); // Empty dependency array runs only once on mount


  // Show loading indicator while checking auth state
  if (loading) {
      return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // If not authenticated, show the login form
  if (!isAuthenticated || !adminPassword) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, show the Admin Dashboard
  // Pass the confirmed admin password to the dashboard for API calls
  return <AdminDashboard adminPassword={adminPassword} onLogout={handleLogout} />;
}
