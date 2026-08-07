import type { Locale } from "./config";
import { DEFAULT_LOCALE } from "./config";

// UI chrome only. Curated prose (synopses, era and event descriptions, order
// rationales) lives in the content repo and is never translated here - the
// engine must not contain a sentence about a book. Keys are dotted by surface.

export const messages = {
  en: {
    "nav.signIn": "Sign in",
    "nav.signOut": "Sign out",
    "nav.myShelf": "My shelf",
    "nav.back": "Orrery",

    "home.tagline": "Read the whole thing, in context.",
    "home.lede":
      "Not just what order to read a franchise, but how to experience it in its moment - each book set against the life, world, and cultural events that shaped it.",
    "home.franchises": "Franchises",
    "home.authors": "Authors",
    "home.empty": "No authors yet.",

    "franchise.works": "works",
    "franchise.readingOrders": "Reading orders",
    "franchise.walkBlurb":
      "Below is the chronological walk: every work in publication order, in the weather it was written in.",
    "franchise.curatedAlternatives": "Curated alternatives:",
    "franchise.entering": "entering",
    "franchise.seriesCount": "series",
    "franchise.alsoAppearsIn": "Also collaborated on",
    "work.withCoAuthorPrefix": "with",
    "event.permalink": "Link to this event",
    "author.about": "About the author",
    "author.alsoWroteAs": "Also wrote as {name}.",
    "author.aged": "(aged {age})",
    "event.aged": "aged {age}",
    "event.elapsed": "{n} years later",
    "home.continueReading": "Continue reading",
    "home.series": "Popular series",
    "home.seriesBooks": "books",
    "work.forthcoming": "Forthcoming",
    "work.publishedAs": "as {name}",
    "work.format.novella": "Novella",
    "work.format.short-story": "Short story",
    "work.format.short-story-collection": "Short story collection",
    "work.format.poem": "Poem",
    "work.format.poetry-collection": "Poetry collection",
    "work.format.essay": "Essay",
    "work.format.essay-collection": "Essay collection",
    "work.format.memoir": "Memoir",
    "work.format.nonfiction": "Nonfiction",
    "work.format.reference": "Reference",
    "work.format.screenplay": "Screenplay",
    "work.format.play": "Stage play",
    "work.format.tv-series": "TV series",
    "work.format.graphic-novel": "Graphic novel",
    "work.format.picture-book": "Picture book",
    "work.format.anthology": "Anthology",
    "order.defaultName": "Complete, in publication order",
    "order.defaultRationale":
      "Every published work in the order it appeared - the default way to read the whole body of work.",

    "nav.whereToStart": "Where to start",

    "progress.reading": "Reading",
    "progress.read": "Read",
    "progress.readDone": "Read ✓",
    "progress.ofRead": "of {total} read",
    "progress.inProgress": "{n} in progress",
    "progress.guestNote": "Tracked in this browser - sign in to keep it.",

    "spoiler.hiddenUntil": "Hidden until you finish {work}",
    "spoiler.hidden": "Hidden to protect a reveal",
    "spoiler.reveal": "Reveal",

    "wizard.title": "Where to start",
    "wizard.lede":
      "{count} works is a lot of doors. Answer two questions and we'll point you at the right one - every path here is curated, with the reasoning attached.",
    "wizard.q1": "How well do you know this world?",
    "wizard.q1.new": "Completely new",
    "wizard.q1.returning": "Read a few, want direction",
    "wizard.q1.completionist": "I intend to read everything",
    "wizard.q2": "How much are you signing up for?",
    "wizard.q2.taste": "A book or three - a taste",
    "wizard.q2.arc": "One great series or thread",
    "wizard.q2.complete": "The whole body of work",
    "wizard.startHere": "Start here",
    "wizard.because": "because {reasons}",
    "wizard.otherWays": "Other ways in ({n})",
    "wizard.hideOther": "Hide the other paths",
    "wizard.followsOrder": "Follows the order",




    "copy.find": "Find a copy",
    "copy.hide": "Hide copies",
    "copy.country": "Country for store links",
    "copy.anywhere": "Anywhere",
    "copy.readFree": "Read for free",

    "shelf.title": "Your shelf",
    "shelf.signInPrompt": "Sign in to track your reading and see it in context.",
    "shelf.read": "read",
    "shelf.reading": "reading",
    "shelf.badges": "badges",
    "shelf.yearInReading": "Year in reading",
    "shelf.importReading": "Import reading",
    "shelf.moderate": "Moderate",

    "recap.title": "Your year in reading",
    "recap.signInPrompt": "Sign in to see your year in context.",
    "recap.books": "books",
    "recap.franchises": "franchises",
    "recap.avgGap": "avg years behind",
    "recap.writingYears": "writing years crossed",
    "recap.theBooks": "The books, oldest writing first",

    "auth.welcomeBack": "Welcome back",
    "auth.lede": "Track your reading and see it in context.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign in",
    "auth.createShelf": "Create your shelf",
    "auth.createAccount": "New here? Create an account",
    "auth.working": "Working…",

    "meta.franchise": "{name} - reading order & timeline | Orrery",
    "meta.start": "Where to start with {name} | Orrery",
    "meta.compare": "{name} - compare reading orders | Orrery",
    "orders.reading": "Reading order",
    "orders.chronological": "Everything, in publication order",
    "orders.debated": "Contested placements",
    "contribute.title": "Something wrong, or missing?",
    "contribute.lede": "Canon here is curated in the open, and corrections are welcome.",
    "contribute.reportError": "Report an error",
    "contribute.missingWork": "Add a missing book",
    "contribute.readingOrder": "Propose a reading order",
    "contribute.newAuthor": "Request an author",
    "contribute.repo": "Browse the content repo",
    "community.orders": "Community orders",
    "community.submit": "Submit an order →",
    "community.empty": "No community orders yet. Be the first to propose one.",
    "shelf.signIn": "Sign in",
    "shelf.stats.read": "read",
    "recap.yearInReading": "Year in reading",
    "import.title": "Import your reading",
    "moderate.queue": "Moderation queue",
    "orders.submitTitle": "Submit a reading order",
    "orders.orderName": "Order name",
    "profile.public": "Public profile",
    "profile.displayName": "Display name",
    "profile.makePublic": "Make my shelf public",
    "shelf.backLink": "Your shelf",
    "shelf.privateNote": "Your shelf is private until you make it public. A public shelf lives at",
    "meta.recap": "Year in reading | Orrery",
    "offline.label": "no connection",
    "offline.title": "You are offline",
    "offline.body": "Pages you have already visited are still here. Anything new will load again once you are back.",
    "locale.switch": "Language",
  },

  "pt-PT": {
    "nav.signIn": "Entrar",
    "nav.signOut": "Sair",
    "nav.myShelf": "A minha estante",
    "nav.back": "Orrery",

    "home.tagline": "Ler a obra inteira, em contexto.",
    "home.lede":
      "Não apenas por que ordem ler uma obra, mas como vivê-la no seu momento - cada livro contra a vida, o mundo e os acontecimentos culturais que o moldaram.",
    "home.franchises": "Autores e universos",
    "home.authors": "Autores",
    "home.empty": "Ainda não há autores.",

    "franchise.works": "obras",
    "franchise.readingOrders": "Ordens de leitura",
    "franchise.walkBlurb":
      "Abaixo fica o percurso cronológico: todas as obras por ordem de publicação, no clima em que foram escritas.",
    "franchise.curatedAlternatives": "Alternativas seleccionadas:",
    "franchise.entering": "a entrar em",
    "franchise.seriesCount": "séries",
    "franchise.alsoAppearsIn": "Também colaborou em",
    "work.withCoAuthorPrefix": "com",
    "event.permalink": "Ligação para este acontecimento",
    "author.about": "Sobre o autor",
    "author.alsoWroteAs": "Também publicou como {name}.",
    "author.aged": "({age} anos)",
    "event.aged": "{age} anos",
    "event.elapsed": "{n} anos depois",
    "home.continueReading": "Continuar a ler",
    "home.series": "Séries populares",
    "home.seriesBooks": "livros",
    "work.forthcoming": "A publicar",
    "work.publishedAs": "como {name}",
    "work.format.novella": "Novela",
    "work.format.short-story": "Conto",
    "work.format.short-story-collection": "Coletânea de contos",
    "work.format.poem": "Poema",
    "work.format.poetry-collection": "Coletânea de poesia",
    "work.format.essay": "Ensaio",
    "work.format.essay-collection": "Coletânea de ensaios",
    "work.format.memoir": "Memórias",
    "work.format.nonfiction": "Não-ficção",
    "work.format.reference": "Obra de referência",
    "work.format.screenplay": "Guião",
    "work.format.play": "Peça de teatro",
    "work.format.tv-series": "Série de televisão",
    "work.format.graphic-novel": "Novela gráfica",
    "work.format.picture-book": "Livro ilustrado",
    "work.format.anthology": "Antologia",
    "order.defaultName": "Completa, por ordem de publicação",
    "order.defaultRationale":
      "Todas as obras publicadas, pela ordem em que surgiram - a forma predefinida de ler a obra completa.",

    "nav.whereToStart": "Por onde começar",

    "progress.reading": "A ler",
    "progress.read": "Lido",
    "progress.readDone": "Lido ✓",
    "progress.ofRead": "de {total} lidos",
    "progress.inProgress": "{n} em curso",
    "progress.guestNote": "Guardado neste navegador - entre na conta para o manter.",

    "spoiler.hiddenUntil": "Escondido até terminar {work}",
    "spoiler.hidden": "Escondido para não revelar",
    "spoiler.reveal": "Revelar",

    "wizard.title": "Por onde começar",
    "wizard.lede":
      "{count} obras são muitas portas. Responda a duas perguntas e indicamos-lhe a certa - todos os percursos aqui são seleccionados, com o raciocínio à vista.",
    "wizard.q1": "Quão bem conhece este mundo?",
    "wizard.q1.new": "Completamente novo",
    "wizard.q1.returning": "Já li alguns, quero orientação",
    "wizard.q1.completionist": "Tenciono ler tudo",
    "wizard.q2": "A que se está a comprometer?",
    "wizard.q2.taste": "Um livro ou três - uma amostra",
    "wizard.q2.arc": "Uma grande série ou linha",
    "wizard.q2.complete": "A obra completa",
    "wizard.startHere": "Comece aqui",
    "wizard.because": "porque {reasons}",
    "wizard.otherWays": "Outras formas de entrar ({n})",
    "wizard.hideOther": "Esconder os outros percursos",
    "wizard.followsOrder": "Segue a ordem",




    "copy.find": "Encontrar um exemplar",
    "copy.hide": "Esconder",
    "copy.country": "País para as lojas",
    "copy.anywhere": "Qualquer país",
    "copy.readFree": "Ler gratuitamente",

    "shelf.title": "A sua estante",
    "shelf.signInPrompt": "Entre na conta para acompanhar as suas leituras e vê-las em contexto.",
    "shelf.read": "lidos",
    "shelf.reading": "a ler",
    "shelf.badges": "distintivos",
    "shelf.yearInReading": "O ano em leituras",
    "shelf.importReading": "Importar leituras",
    "shelf.moderate": "Moderar",

    "recap.title": "O seu ano em leituras",
    "recap.signInPrompt": "Entre na conta para ver o seu ano em contexto.",
    "recap.books": "livros",
    "recap.franchises": "autores",
    "recap.avgGap": "anos de atraso, em média",
    "recap.writingYears": "anos de escrita percorridos",
    "recap.theBooks": "Os livros, do mais antigo ao mais recente",

    "auth.welcomeBack": "Bem-vindo de volta",
    "auth.lede": "Acompanhe as suas leituras e veja-as em contexto.",
    "auth.email": "Email",
    "auth.password": "Palavra-passe",
    "auth.signIn": "Entrar",
    "auth.createShelf": "Criar a sua estante",
    "auth.createAccount": "É novo por aqui? Criar conta",
    "auth.working": "A processar…",

    "meta.franchise": "{name} - ordem de leitura e cronologia | Orrery",
    "meta.start": "Por onde começar em {name} | Orrery",
    "meta.compare": "{name} - comparar ordens de leitura | Orrery",
    "orders.reading": "Ordem de leitura",
    "orders.chronological": "Tudo, por ordem de publicação",
    "orders.debated": "Colocações contestadas",
    "contribute.title": "Algo errado, ou em falta?",
    "contribute.lede": "O cânone aqui é curado em aberto, e as correcções são bem-vindas.",
    "contribute.reportError": "Reportar um erro",
    "contribute.missingWork": "Adicionar um livro em falta",
    "contribute.readingOrder": "Propor uma ordem de leitura",
    "contribute.newAuthor": "Pedir um autor",
    "contribute.repo": "Ver o repositório de conteúdo",
    "community.orders": "Ordens da comunidade",
    "community.submit": "Propor uma ordem →",
    "community.empty": "Ainda não há ordens da comunidade. Seja o primeiro a propor uma.",
    "shelf.signIn": "Entrar",
    "shelf.stats.read": "lidos",
    "recap.yearInReading": "O ano em leituras",
    "import.title": "Importar as suas leituras",
    "moderate.queue": "Fila de moderação",
    "orders.submitTitle": "Propor uma ordem de leitura",
    "orders.orderName": "Nome da ordem",
    "profile.public": "Perfil público",
    "profile.displayName": "Nome a mostrar",
    "profile.makePublic": "Tornar a minha estante pública",
    "shelf.backLink": "A sua estante",
    "shelf.privateNote": "A sua estante fica privada até a tornar pública. Uma estante pública vive em",
    "meta.recap": "O ano em leituras | Orrery",
    "offline.label": "sem ligação",
    "offline.title": "Está offline",
    "offline.body": "As páginas que já visitou continuam aqui. O resto volta a carregar assim que tiver ligação.",
    "locale.switch": "Idioma",
  },
} as const;

export type MessageKey = keyof (typeof messages)["en"];

/**
 * Translate a key for a locale, interpolating {placeholders}. Falls back to
 * the default locale per key, so a partially translated catalog degrades one
 * string at a time rather than breaking the page.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const table = messages[locale] as Record<string, string>;
  const fallback = messages[DEFAULT_LOCALE] as Record<string, string>;
  let text = table?.[key] ?? fallback[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** A bound translator for a locale. */
export function translator(locale: Locale) {
  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
}
