/**
 * Seed — Decks TikTok basés sur le rapport de recherche
 * Run : npx tsx prisma/seed-tiktok.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Decks & cartes ──────────────────────────────────────────────────────────

const DECKS = [
  // ─── DECK 1 ───────────────────────────────────────────────────────────────
  {
    title:       "TikTok — L'algorithme expliqué simplement",
    description: "Comment TikTok décide qui voit ta vidéo, et pourquoi.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Qu'est-ce que l'algorithme TikTok ?",
        back:     "C'est le système qui choisit quelles vidéos montrer à chaque personne. Il analyse ce que tu regardes, ce que tu aimes, et ce que tu skipes pour deviner ce qui t'intéresse.",
        cardType: "definition",
      },
      {
        front:    "Quel est le signal le plus important pour l'algorithme TikTok ?",
        back:     "Le temps de visionnage. Si les gens regardent ta vidéo jusqu'au bout (ou presque), TikTok comprend que c'est une bonne vidéo et la montre à plus de monde.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce que le 'watch in full' ?",
        back:     "C'est quand quelqu'un regarde ta vidéo en entier sans la passer. TikTok considère ça comme un très bon signe et pousse la vidéo à plus de personnes.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi le skip est dangereux pour tes vidéos ?",
        back:     "Si beaucoup de gens appuient sur 'skip' rapidement, TikTok comprend que ta vidéo ne les intéresse pas. Il arrête de la montrer.",
        cardType: "application",
      },
      {
        front:    "Les likes sont-ils le signal le plus important sur TikTok ?",
        back:     "Non. Les likes comptent, mais ils sont moins importants que le temps de visionnage et les partages. Une vidéo avec peu de likes mais que les gens regardent jusqu'au bout peut très bien marcher.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi les partages sont-ils très importants en 2026 ?",
        back:     "Quand quelqu'un partage ta vidéo, ça veut dire qu'il la trouve assez utile ou drôle pour la montrer à ses amis. TikTok voit ça comme un très bon signe et pousse encore plus la vidéo.",
        cardType: "application",
      },
      {
        front:    "Comment l'algorithme TikTok apprend ce que tu aimes ?",
        back:     "Il regarde tes 200 premières vidéos sur l'application. Après ça, il a déjà une bonne idée de tes intérêts et te montre du contenu de plus en plus ciblé.",
        cardType: "example",
      },
      {
        front:    "Qu'est-ce que le 'For You Page' (FYP) ?",
        back:     "C'est la page principale de TikTok où apparaissent les vidéos recommandées. Si TikTok met ta vidéo sur le FYP de beaucoup de gens, elle peut devenir virale.",
        cardType: "definition",
      },
      {
        front:    "Est-ce qu'un nouveau compte est pénalisé par l'algorithme ?",
        back:     "Non. TikTok ne pénalise pas les nouveaux comptes. Un petit compte peut même avoir un meilleur taux d'engagement qu'un grand compte. Il faut juste tester rapidement.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce que le 'follow' apporte à l'algorithme ?",
        back:     "Quand quelqu'un suit ton compte après avoir vu ta vidéo, c'est un signal très fort. Ça dit à TikTok que ton contenu donne envie de revenir.",
        cardType: "application",
      },
      {
        front:    "Comment l'algorithme TikTok fonctionne différemment dans la recherche ?",
        back:     "Quand quelqu'un cherche un mot-clé, TikTok montre les vidéos qui correspondent le mieux à ce mot. Ici, les hashtags et les mots dans la description comptent beaucoup plus.",
        cardType: "comparison",
      },
      {
        front:    "Pourquoi TikTok ne peut pas être optimisé avec une 'formule fixe' ?",
        back:     "Parce que le poids de chaque signal change selon la surface (FYP, recherche, LIVE, Shop) et dans le temps. Ce qui marche aujourd'hui peut ne plus marcher demain.",
        cardType: "definition",
      },
    ],
  },

  // ─── DECK 2 ───────────────────────────────────────────────────────────────
  {
    title:       "TikTok — Créer des vidéos qui cartonnent",
    description: "Les bonnes pratiques concrètes pour faire des vidéos que les gens regardent jusqu'au bout.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Qu'est-ce qu'un 'hook' dans une vidéo TikTok ?",
        back:     "C'est la première seconde de ta vidéo. Si elle n'accroche pas immédiatement, les gens swipent. Le hook doit donner envie de rester tout de suite.",
        cardType: "definition",
      },
      {
        front:    "Quelle est la règle numéro 1 pour garder les gens sur ta vidéo ?",
        back:     "Chaque seconde doit donner envie de regarder la suivante. Ton montage doit être rapide, ton message clair, et la récompense (la réponse, la surprise) doit arriver vite.",
        cardType: "application",
      },
      {
        front:    "Qu'est-ce qu'une création 'TikTok-first' ?",
        back:     "C'est une vidéo pensée directement pour TikTok : format vertical (9:16), montage dynamique, texte à l'écran, son pertinent. Pas une vidéo faite ailleurs et copiée sur TikTok.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi mettre du texte à l'écran dans tes vidéos ?",
        back:     "Beaucoup de gens regardent TikTok sans le son. Le texte permet de comprendre la vidéo même en silence. TikTok dit aussi que texte + son ensemble captent mieux l'attention.",
        cardType: "application",
      },
      {
        front:    "Combien de fois par semaine faut-il poster pour bien démarrer ?",
        back:     "Entre 3 et 5 fois par semaine. Poster trop souvent (plus de 6 fois) peut baisser l'engagement. La qualité compte plus que la quantité.",
        cardType: "definition",
      },
      {
        front:    "Comment bien choisir les hashtags d'une vidéo TikTok ?",
        back:     "Mets quelques hashtags précis qui décrivent exactement ta vidéo. Les hashtags très génériques comme #viral ou #foryou ne servent pas à grand chose. Pense comme si quelqu'un cherchait ta vidéo.",
        cardType: "application",
      },
      {
        front:    "Quelle est la meilleure structure pour une vidéo d'expertise ?",
        back:     "1. Montre d'abord le résultat (pour accrocher). 2. Explique le problème que tu résous. 3. Donne ta méthode en étapes simples. 4. Invite à s'abonner pour la suite.",
        cardType: "example",
      },
      {
        front:    "Pourquoi faire une série de vidéos est meilleur qu'une vidéo isolée ?",
        back:     "Une série donne une raison de s'abonner. Les gens veulent voir la suite. C'est plus efficace pour convertir un spectateur en abonné.",
        cardType: "application",
      },
      {
        front:    "Quel est le meilleur moment pour poster sur TikTok ?",
        back:     "Il n'y a pas un seul 'meilleur moment' universel. Il faut regarder dans TikTok Studio les heures où ton audience est active, puis tester.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi éviter de copier une vidéo d'une autre plateforme ?",
        back:     "Les vidéos conçues pour Instagram ou YouTube ne sont pas faites pour TikTok. Elles ont souvent un format différent, pas de texte à l'écran, et un rythme trop lent pour TikTok.",
        cardType: "comparison",
      },
      {
        front:    "Qu'est-ce qu'un bon CTA (appel à l'action) sur TikTok ?",
        back:     "Un CTA simple et direct à la fin de la vidéo : 'Abonne-toi pour la partie 2' ou 'Regarde mon profil pour le guide complet'. Il doit donner une raison claire d'agir.",
        cardType: "example",
      },
    ],
  },

  // ─── DECK 3 ───────────────────────────────────────────────────────────────
  {
    title:       "TikTok — Vendre et convertir",
    description: "Comment transformer les vues en abonnés, et les abonnés en clients.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Quelle est la première étape pour vendre sur TikTok ?",
        back:     "D'abord, trouve quelles vidéos fonctionnent déjà bien de façon naturelle (sans pub). Ce sont ces vidéos que tu devras utiliser comme base pour ta publicité ensuite.",
        cardType: "application",
      },
      {
        front:    "Qu'est-ce que TikTok Shop ?",
        back:     "C'est un système intégré à TikTok qui permet d'acheter des produits directement dans l'app. Tu peux ajouter un lien produit à tes vidéos pour que les gens achètent sans quitter TikTok.",
        cardType: "definition",
      },
      {
        front:    "Quels signaux TikTok Shop regarde-t-il pour recommander un produit ?",
        back:     "Le nombre d'ajouts au panier, d'achats, les avis clients, la clarté des photos et descriptions, la vitesse de livraison, et le taux de retour. Ce n'est pas que créatif : c'est aussi opérationnel.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce qu'un Spark Ad sur TikTok ?",
        back:     "C'est une pub qui part d'une de tes vraies vidéos (organiques) déjà populaires. Tu mets du budget derrière une vidéo qui marche déjà pour toucher encore plus de monde.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi les Spark Ads sont meilleures que les pubs classiques ?",
        back:     "Parce qu'elles ont un engagement 159% plus élevé. Les gens font plus confiance à une vraie vidéo de créateur qu'à une pub fabriquée. Et les likes/partages gagnés vont sur ta vidéo originale.",
        cardType: "comparison",
      },
      {
        front:    "Qu'est-ce qu'un programme d'affiliation sur TikTok ?",
        back:     "C'est quand d'autres créateurs font des vidéos pour montrer ton produit, et tu leur donnes une commission sur chaque vente qu'ils génèrent. Bon point de départ : commencer à 10%.",
        cardType: "definition",
      },
      {
        front:    "À quoi servent les Search Ads sur TikTok ?",
        back:     "À toucher les gens qui cherchent activement ton type de produit ou service. C'est comme Google Ads mais sur TikTok. Très utile quand ta cible a une intention d'achat claire.",
        cardType: "application",
      },
      {
        front:    "Comment transformer son profil TikTok en page de vente ?",
        back:     "Pinner 3 vidéos clés : 1. 'Qui je suis et pour qui'. 2. 'Une preuve ou un résultat'. 3. 'Mon offre ou produit'. La bio doit être claire et le lien visible.",
        cardType: "application",
      },
      {
        front:    "Quelle est l'erreur à éviter avec la pub TikTok pour un nouveau compte ?",
        back:     "Mettre du budget sur une vidéo qui n'a pas encore fait ses preuves. Il faut d'abord tester en organique, identifier les vidéos qui convertissent, puis mettre de la pub sur celles-là uniquement.",
        cardType: "application",
      },
      {
        front:    "Qu'est-ce que GMV Max sur TikTok ?",
        back:     "C'est le type de campagne publicitaire par défaut de TikTok Shop depuis juillet 2025. Il optimise automatiquement pour maximiser le chiffre d'affaires (GMV = Gross Merchandise Value).",
        cardType: "definition",
      },
    ],
  },

  // ─── DECK 4 ───────────────────────────────────────────────────────────────
  {
    title:       "TikTok — Éviter les restrictions et rester dans les règles",
    description: "Ce qui peut bloquer ton compte, comment l'éviter, et quoi faire si ça arrive.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Qu'est-ce qu'un 'shadowban' sur TikTok ?",
        back:     "Ce n'est pas un terme officiel TikTok. Dans la réalité, ça correspond surtout à un compte 'inéligible à la recommandation'. TikTok continue de publier tes vidéos mais arrête de les pousser à de nouvelles personnes.",
        cardType: "definition",
      },
      {
        front:    "Comment savoir si ton compte est restreint sur TikTok ?",
        back:     "TikTok t'envoie une notification. Tu peux aussi voir le statut de ton compte dans TikTok Studio ou dans le Centre de Sécurité. Si une vidéo est inéligible au FYP, c'est indiqué dans ses statistiques.",
        cardType: "application",
      },
      {
        front:    "Quelles sont les causes les plus courantes de restriction sur TikTok ?",
        back:     "Violer les règles communautaires, publier du contenu sous droits d'auteur (musique non autorisée), ne pas mettre le bon label sur une pub, utiliser de l'IA sans le signaler, ou acheter de faux abonnés.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi acheter des faux abonnés ou faux likes est une mauvaise idée ?",
        back:     "TikTok détecte et supprime des millions de faux comptes chaque mois. Ça peut mener à la suspension de ton compte. Et ça fausse tes statistiques sans t'apporter de vrais clients.",
        cardType: "application",
      },
      {
        front:    "Doit-on indiquer quand une vidéo est une publicité sur TikTok ?",
        back:     "Oui, c'est obligatoire. Si tu parles d'un produit en échange d'argent ou de cadeaux, tu dois activer le label 'contenu promotionnel'. Ne pas le faire peut entraîner la suppression de ta vidéo.",
        cardType: "definition",
      },
      {
        front:    "Que faire si une vidéo TikTok est supprimée par erreur ?",
        back:     "Faire appel via l'application. Important : ne supprime pas toi-même la vidéo contestée avant la fin de l'appel. Si tu la supprimes, TikTok ne peut plus retirer la violation de ton dossier.",
        cardType: "application",
      },
      {
        front:    "Peut-on mettre de l'IA dans ses vidéos TikTok sans problème ?",
        back:     "Oui, si tu l'indiques correctement. TikTok demande d'étiqueter les contenus IA réalistes (visages, voix, situations). Mettre le bon label n'affecte pas la distribution. Ne pas le mettre peut entraîner une suppression.",
        cardType: "definition",
      },
      {
        front:    "Comment TikTok modère les vidéos ?",
        back:     "D'abord une vérification automatique (robot). Si c'est ambigu, un humain regarde. Les violations claires sont supprimées automatiquement. En 2025, 93,8% des suppressions ont été faites sans humain.",
        cardType: "example",
      },
      {
        front:    "Quelle est la différence entre un compte 'inéligible à la recommandation' et un compte banni ?",
        back:     "Inéligible à la recommandation = tes vidéos existent mais ne sont plus poussées sur le FYP. Banni = ton compte est entièrement bloqué, tu ne peux plus publier du tout.",
        cardType: "comparison",
      },
      {
        front:    "Qu'est-ce que les 'Content Levels' sur TikTok ?",
        back:     "TikTok peut limiter certaines vidéos à un public plus âgé au lieu de les supprimer complètement. Par exemple, un contenu sensible mais pas interdit sera restreint aux adultes plutôt que retiré.",
        cardType: "definition",
      },
    ],
  },
];

// ─── Insertion en base ───────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Démarrage du seed TikTok…\n");

  // Récupérer l'utilisateur universel (même logique que authMiddleware)
  const user = await prisma.user.upsert({
    where:  { clerkId: "private" },
    create: { clerkId: "private", email: "owner@selmenlearn.app", name: "Apprenant" },
    update: {},
  });

  console.log(`✅ Utilisateur : ${user.name} (${user.id})\n`);

  for (const deckData of DECKS) {
    // Vérifier si ce deck existe déjà (pour éviter les doublons)
    const existing = await prisma.deck.findFirst({
      where: { userId: user.id, title: deckData.title },
    });

    if (existing) {
      console.log(`⏭  Deck déjà existant : "${deckData.title}" — ignoré`);
      continue;
    }

    // Créer le deck
    const deck = await prisma.deck.create({
      data: {
        userId:           user.id,
        title:            deckData.title,
        description:      deckData.description,
        subject:          deckData.subject,
        sourceType:       "manual",
        generationStatus: "done",
      },
    });

    // Créer les cartes + leurs CardReview (pour qu'elles apparaissent dans la file de révision)
    for (const cardData of deckData.cards) {
      const card = await prisma.card.create({
        data: {
          deckId:   deck.id,
          front:    cardData.front,
          back:     cardData.back,
          cardType: cardData.cardType,
        },
      });

      await prisma.cardReview.create({
        data: {
          userId:    user.id,
          cardId:    card.id,
          nextReview: new Date(), // dispo immédiatement
        },
      });
    }

    console.log(`✅ Deck créé : "${deck.title}" (${deckData.cards.length} cartes)`);
  }

  console.log("\n🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
