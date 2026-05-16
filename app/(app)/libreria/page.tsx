'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Search, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  Star,
  ExternalLink,
  BookOpen,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookReader } from '@/components/book-reader';

interface HelpBook {
  id: string;
  title: string;
  author: string;
  category: 'Ansiedad' | 'Autoestima' | 'Relaciones' | 'Crecimiento' | 'Duelo';
  description: string;
  cover: string;
  rating: number;
  content: string[]; // Paginated text
}

const books: HelpBook[] = [
  {
    id: '1',
    title: 'Meditaciones',
    author: 'Marco Aurelio',
    category: 'Crecimiento',
    description: 'Sabiduría estoica atemporal sobre cómo mantener la calma y la virtud en un mundo caótico.',
    cover: '🏛️',
    rating: 4.9,
    content: [
      "Libro I\n\nDe mi abuelo Vero: el buen carácter y la serenidad.\n\nDe la fama y la memoria de mi progenitor: el carácter modesto y varonil.\n\nDe mi madre: la piedad y la generosidad; la abstención no sólo de obrar mal, sino incluso de pensar en ello.",
      "Libro II\n\nAl amanecer, dite a ti mismo: me encontraré con un indiscreto, con un ingrato, con un insolente, con un mentiroso, con un envidioso, con un insociable. Todo eso les sucede por ignorancia de los bienes y de los males.",
      "No malgastes la parte de vida que te queda en imaginar cosas sobre otros, a no ser que lo hagas para un bien común. Pues te privas de otra tarea al fantasear qué hace fulano y por qué, qué dice, qué piensa y qué trama.",
      "Recuerda cuánto tiempo hace que aplazas estas cosas y cuántas veces has recibido oportunidades de los dioses sin aprovecharlas. Es preciso que desde ahora comprendas qué mundo eres parte."
    ]
  },
  {
    id: '2',
    title: 'Como un hombre piensa',
    author: 'James Allen',
    category: 'Autoestima',
    description: 'Un clásico sobre cómo nuestros pensamientos moldean nuestra realidad y carácter.',
    cover: '🌱',
    rating: 4.8,
    content: [
      "Pensamiento y Carácter\n\nEl aforismo, 'Como un hombre piensa en su corazón, así es él', no solo abarca todo el ser de un hombre, sino que es tan comprensivo que llega a cada condición y circunstancia de su vida.",
      "Un hombre es literalmente lo que piensa, siendo su carácter la suma total de todos sus pensamientos. Así como una planta brota de la semilla, cada acto de un hombre brota de las semillas invisibles del pensamiento.",
      "La mente es como un jardín, que puede ser cultivado inteligentemente o dejado crecer salvaje; pero sea cultivado o descuidado, debe, y producirá. Si no se siembran semillas útiles, entonces semillas de maleza caerán."
    ]
  },
  {
    id: '3',
    title: 'El Arte de la Prudencia',
    author: 'Baltasar Gracián',
    category: 'Relaciones',
    description: 'Consejos sabios sobre cómo navegar las relaciones humanas y el éxito con discreción.',
    cover: '💎',
    rating: 4.7,
    content: [
      "Aforismo 1: Todo está ya en su punto, y el ser persona en el mayor. Más se requiere hoy para un sabio que se requería para siete en otro tiempo.",
      "Aforismo 2: Carácter e Inteligencia. Los dos polos del lucimiento humano: uno sin otro, felicidad a medias. No basta el entender, se requiere el ánimo.",
      "Aforismo 3: Dejar con hambre. Se ha de dejar con el deseo en los labios. Incluso con la sed se debe jugar: el que tiene mucho, siempre quiere más."
    ]
  },
  {
    id: '4',
    title: 'Los cuatro acuerdos (Resumen)',
    author: 'Miguel Ruiz',
    category: 'Autoestima',
    description: 'Sabiduría tolteca para vivir con libertad, felicidad y amor.',
    cover: '📜',
    rating: 4.8,
    content: [
      "Introducción\n\nHace tres mil años, había un ser humano igual que tú y que yo que vivía cerca de una ciudad rodeada de montañas. Estudiaba para convertirse en chamán, pero no estaba totalmente de acuerdo con todo lo que aprendía.",
      "El Primer Acuerdo: Sé impecable con tus palabras. Parece muy simple, pero es sumamente poderoso. ¿Por qué tus palabras? Porque tus palabras son el poder que tienes para crear.",
      "El Segundo Acuerdo: No te tomes nada personalmente. Suceda lo que suceda a tu alrededor, no te lo tomes personalmente."
    ]
  }
];

export default function LibreriaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [readingBook, setReadingBook] = useState<HelpBook | null>(null);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(books.map(b => b.category)));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 pb-32 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-foreground">Biblioteca de Luz</h1>
        <p className="text-muted-foreground font-light italic">
          Palabras que sanan y guían tu camino interior.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Busca un libro o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              !selectedCategory ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                selectedCategory === category ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBooks.map((book, i) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-3xl p-6 flex gap-6 hover:bg-secondary/30 transition-all group border border-white/5"
            >
              <div className="w-24 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                {book.cover}
              </div>
              
              <div className="flex flex-col justify-between py-1 min-w-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
                      {book.category}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-yellow-500 font-bold">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {book.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <p className="text-[10px] text-muted-foreground/80 line-clamp-2 leading-relaxed mt-2">
                    {book.description}
                  </p>
                </div>

                <button 
                  onClick={() => setReadingBook(book)}
                  className="mt-4 flex items-center gap-2 text-xs font-bold text-primary hover:underline group-hover:gap-3 transition-all"
                >
                  <BookOpen className="w-3 h-3" />
                  Leer ahora
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {readingBook && (
          <BookReader 
            book={readingBook} 
            onClose={() => setReadingBook(null)} 
          />
        )}
      </AnimatePresence>

      {filteredBooks.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl opacity-20">📚</div>
          <p className="text-muted-foreground italic">No encontramos libros con esa búsqueda.</p>
        </div>
      )}
    </div>
  );
}
