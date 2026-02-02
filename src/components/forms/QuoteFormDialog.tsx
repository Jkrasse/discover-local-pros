import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const quoteSchema = z.object({
  name: z.string().min(2, 'Ange ditt namn').max(100),
  email: z.string().email('Ange en giltig e-postadress').max(255),
  phone: z.string().optional(),
  move_date: z.string().optional(),
  from_area: z.string().optional(),
  to_area: z.string().optional(),
  housing_type: z.string().optional(),
  message: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  businessId?: string;
  cityId?: string;
  cityName?: string;
  serviceId?: string;
  serviceName?: string;
}

const housingTypes = [
  { value: 'lagenhet', label: 'Lägenhet' },
  { value: 'villa', label: 'Villa/Radhus' },
  { value: 'kontor', label: 'Kontor' },
  { value: 'annat', label: 'Annat' },
];

export function QuoteFormDialog({
  open,
  onOpenChange,
  businessName,
  businessId,
  cityId,
  cityName = '',
  serviceId,
  serviceName = 'flyttfirma',
}: QuoteFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      move_date: '',
      from_area: '',
      to_area: '',
      housing_type: '',
      message: '',
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('leads').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        move_date: data.move_date || null,
        from_area: data.from_area || null,
        to_area: data.to_area || null,
        housing_type: data.housing_type || null,
        message: data.message || null,
        city_id: cityId || null,
        service_id: serviceId || null,
        business_id: businessId || null,
        source_url: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      }]);

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Tack för din förfrågan!',
        description: `${businessName} återkommer till dig så snart som möjligt.`,
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Något gick fel',
        description: 'Försök igen eller kontakta oss direkt.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after dialog closes
    setTimeout(() => {
      setIsSuccess(false);
      form.reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            Få offert från {businessName}
          </DialogTitle>
          <DialogDescription>
            Fyll i dina uppgifter så kontaktar {businessName} dig med en kostnadsfri offert.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tack för din förfrågan!</h3>
            <p className="text-muted-foreground mb-6">
              {businessName} har tagit emot dina uppgifter och återkommer inom kort.
            </p>
            <Button onClick={handleClose}>Stäng</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Namn *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ditt namn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-post *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="din@email.se" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="070-123 45 67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="move_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Önskat flyttdatum</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="from_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flytta från</FormLabel>
                      <FormControl>
                        <Input placeholder="Område/adress" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="to_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flytta till</FormLabel>
                      <FormControl>
                        <Input placeholder="Område/adress" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="housing_type"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Typ av boende</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Välj typ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {housingTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meddelande</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Berätta mer om din flytt..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Skicka förfrågan
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Genom att skicka godkänner du vår{' '}
                <a href="/privacy-policy" className="underline hover:text-primary">
                  integritetspolicy
                </a>
                .
              </p>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
