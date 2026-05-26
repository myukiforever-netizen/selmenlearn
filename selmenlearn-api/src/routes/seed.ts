/**
 * Route de seed one-shot — GET /seed/tiktok
 * Crée 4 decks TikTok avec des flashcards en langage simple.
 * Idempotente : ne recrée pas les decks déjà existants.
 */
import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

const seed = new Hono();

const DECKS = [
  {
    title:       "TikTok — L'algorithme expliqué simplement",
    description: "Comment TikTok décide qui voit ta vidéo, et pourquoi.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Qu'est-ce que l'algorithme TikTok ?",
        back:     "C'est le système qui choisit quelles vidéos montrer à chaque personne. Il regarde ce que tu regardes, ce que tu aimes, et ce que tu passes pour deviner tes goûts.",
        cardType: "definition",
      },
      {
        front:    "Quel est le signal le plus important pour l'algorithme TikTok ?",
        back:     "Le temps de visionnage. Si les gens regardent ta vidéo jusqu'au bout, TikTok la pousse à plus de monde. Si les gens swipent vite, TikTok arrête de la montrer.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce que le 'watch in full' ?",
        back:     "C'est quand quelqu'un regarde ta vidéo entièrement sans la passer. C'est un très bon signal : TikTok récompense ça en montrant la vidéo à plus de personnes.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi le 'skip' est mauvais pour une vidéo ?",
        back:     "Si beaucoup de gens passent ta vidéo rapidement, TikTok comprend qu'elle n'intéresse pas. Il arrête de la recommander.",
        cardType: "application",
      },
      {
        front:    "Les likes sont-ils le signal le plus important sur TikTok ?",
        back:     "Non. Les likes comptent, mais moins que le temps de visionnage et les partages. Une vidéo peu aimée mais regardée jusqu'au bout peut très bien marcher.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi les partages comptent beaucoup en 2026 ?",
        back:     "Partager une vidéo veut dire qu'on la trouve assez bien pour la montrer à ses amis. C'est un signal fort que TikTok valorise beaucoup.",
        cardType: "application",
      },
      {
        front:    "Comment TikTok apprend ce que tu aimes ?",
        back:     "Dès les 200 premières vidéos que tu regardes, il commence à cerner tes goûts. Après ça, il te montre un contenu de plus en plus ciblé.",
        cardType: "example",
      },
      {
        front:    "Qu'est-ce que le For You Page (FYP) ?",
        back:     "C'est la page principale de TikTok avec les vidéos recommandées. Si ta vidéo se retrouve sur le FYP de beaucoup de gens, elle peut devenir virale.",
        cardType: "definition",
      },
      {
        front:    "Un nouveau compte est-il pénalisé par l'algorithme ?",
        back:     "Non. TikTok ne punit pas les nouveaux comptes. Un petit compte peut même avoir un meilleur engagement qu'un grand. Il faut juste tester rapidement.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce que le 'follow' apporte comme signal ?",
        back:     "Quand quelqu'un s'abonne après avoir vu ta vidéo, c'est très fort. Ça dit à TikTok que ton contenu donne envie de revenir.",
        cardType: "application",
      },
      {
        front:    "Comment la recherche fonctionne-t-elle différemment sur TikTok ?",
        back:     "Quand quelqu'un cherche un mot, TikTok montre les vidéos qui correspondent. Là, les hashtags et les mots dans la description comptent beaucoup plus que d'habitude.",
        cardType: "comparison",
      },
      {
        front:    "Peut-on trouver une 'formule magique' qui marche toujours sur TikTok ?",
        back:     "Non. Le poids de chaque signal change selon le contexte (FYP, recherche, Shop…) et dans le temps. Ce qui marche aujourd'hui peut ne plus marcher demain.",
        cardType: "definition",
      },
    ],
  },

  {
    title:       "TikTok — Créer des vidéos qui marchent",
    description: "Les bases concrètes pour faire des vidéos que les gens regardent jusqu'au bout.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Qu'est-ce qu'un 'hook' dans une vidéo TikTok ?",
        back:     "C'est la toute première seconde. Elle doit donner envie de rester. Si elle n'accroche pas tout de suite, les gens swipent.",
        cardType: "definition",
      },
      {
        front:    "Quelle est la règle de base pour garder les gens sur ta vidéo ?",
        back:     "Chaque seconde doit donner envie de voir la suivante. Montage rapide, message clair, et la 'récompense' (la réponse ou la surprise) doit arriver vite.",
        cardType: "application",
      },
      {
        front:    "Qu'est-ce qu'une vidéo 'TikTok-first' ?",
        back:     "Une vidéo pensée directement pour TikTok : format vertical, montage rapide, texte à l'écran, son adapté. Pas une vidéo copiée depuis Instagram ou YouTube.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi mettre du texte à l'écran dans ses vidéos ?",
        back:     "Beaucoup de gens regardent TikTok sans le son. Le texte permet de comprendre même en silence. TikTok dit aussi que texte + son ensemble capte mieux l'attention.",
        cardType: "application",
      },
      {
        front:    "Combien de fois par semaine faut-il poster pour bien démarrer ?",
        back:     "Entre 3 et 5 fois par semaine. Poster trop souvent (plus de 6 fois) peut baisser l'engagement. La qualité compte plus que la quantité.",
        cardType: "definition",
      },
      {
        front:    "Comment bien choisir ses hashtags ?",
        back:     "Mets 2 à 4 hashtags précis qui décrivent exactement ta vidéo. Les hashtags génériques comme #viral ne servent pas. Pense comme quelqu'un qui chercherait ta vidéo.",
        cardType: "application",
      },
      {
        front:    "Quelle est la meilleure structure pour une vidéo d'expertise ?",
        back:     "1. Montre le résultat (pour accrocher). 2. Explique le problème. 3. Donne ta méthode en étapes. 4. Invite à s'abonner pour la suite.",
        cardType: "example",
      },
      {
        front:    "Pourquoi faire une série est plus efficace qu'une vidéo seule ?",
        back:     "Une série donne une raison de s'abonner. Les gens veulent voir la suite. C'est plus efficace pour transformer un spectateur en abonné.",
        cardType: "application",
      },
      {
        front:    "Y a-t-il un 'meilleur moment universel' pour poster ?",
        back:     "Non. Il faut regarder dans TikTok Studio les heures où ton audience est active, puis tester. Chaque compte est différent.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce qu'un bon appel à l'action (CTA) sur TikTok ?",
        back:     "Quelque chose de simple et direct à la fin : 'Abonne-toi pour la partie 2' ou 'Va voir mon profil pour le guide'. Il doit donner une raison claire d'agir.",
        cardType: "example",
      },
      {
        front:    "Pourquoi ne pas copier ses vidéos d'autres plateformes ?",
        back:     "Les vidéos faites pour Instagram ou YouTube ont un rythme et un format différents. Elles marchent moins bien sur TikTok car elles ne sont pas adaptées au langage de la plateforme.",
        cardType: "comparison",
      },
    ],
  },

  {
    title:       "TikTok — Vendre et convertir",
    description: "Comment transformer ses vues en abonnés, et ses abonnés en clients.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Quelle est la première règle avant de faire de la pub sur TikTok ?",
        back:     "D'abord, trouver quelles vidéos fonctionnent déjà bien naturellement (sans pub). C'est sur ces vidéos qu'on met ensuite du budget. Pas sur des vidéos qui n'ont pas encore fait leurs preuves.",
        cardType: "application",
      },
      {
        front:    "Qu'est-ce que TikTok Shop ?",
        back:     "Un système dans TikTok pour acheter des produits directement depuis l'app. Tu ajoutes un lien produit à tes vidéos et les gens peuvent acheter sans quitter TikTok.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce que TikTok Shop regarde pour recommander un produit ?",
        back:     "Les ajouts au panier, les achats, les avis clients, la clarté des photos et descriptions, la vitesse de livraison, et le taux de retour. Ce n'est pas que créatif : c'est aussi la qualité du service.",
        cardType: "definition",
      },
      {
        front:    "Qu'est-ce qu'un Spark Ad ?",
        back:     "Une pub basée sur une vraie vidéo de ton compte qui marche déjà. Tu mets du budget derrière pour toucher encore plus de monde. Plus efficace qu'une pub créée de zéro.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi les Spark Ads marchent-elles mieux que les pubs classiques ?",
        back:     "Elles ont 159% plus d'engagement. Les gens font plus confiance à une vraie vidéo de créateur qu'à une pub fabriquée. Et les likes/partages vont sur ta vidéo originale.",
        cardType: "comparison",
      },
      {
        front:    "Qu'est-ce qu'un programme d'affiliation sur TikTok ?",
        back:     "D'autres créateurs font des vidéos pour montrer ton produit, et tu leur donnes une commission sur chaque vente. Bonne façon de démarrer : commencer autour de 10%.",
        cardType: "definition",
      },
      {
        front:    "À quoi servent les Search Ads sur TikTok ?",
        back:     "À toucher les gens qui cherchent activement ton produit ou service. Très utile quand ta cible a déjà une intention d'achat. C'est comme Google Ads mais sur TikTok.",
        cardType: "application",
      },
      {
        front:    "Comment transformer son profil en page de vente ?",
        back:     "Épingler 3 vidéos : 1. 'Qui je suis'. 2. 'Une preuve ou un résultat'. 3. 'Mon offre'. Bio claire et lien visible. Le profil doit convaincre en quelques secondes.",
        cardType: "application",
      },
      {
        front:    "Qu'est-ce que GMV Max sur TikTok ?",
        back:     "Le type de pub par défaut pour TikTok Shop depuis juillet 2025. Il optimise automatiquement pour maximiser les ventes. GMV = chiffre d'affaires total.",
        cardType: "definition",
      },
      {
        front:    "Compte Business ou compte Personnel : quelle différence clé ?",
        back:     "Personnel = accès à toute la bibliothèque musicale (bien pour l'organique). Business = lien de site dès le départ sans attendre 1000 abonnés. À choisir selon ton objectif principal.",
        cardType: "comparison",
      },
    ],
  },

  {
    title:       "TikTok — Règles, restrictions et shadowban",
    description: "Ce qui peut bloquer ton compte, comment l'éviter, et quoi faire si ça arrive.",
    subject:     "TikTok",
    cards: [
      {
        front:    "Qu'est-ce qu'un 'shadowban' sur TikTok ?",
        back:     "Ce n'est pas un terme officiel TikTok. Dans la réalité, c'est un compte 'inéligible à la recommandation' : tes vidéos sont publiées mais TikTok arrête de les pousser vers de nouvelles personnes.",
        cardType: "definition",
      },
      {
        front:    "Comment savoir si ton compte est restreint ?",
        back:     "TikTok envoie une notification. Tu peux aussi voir le statut de ton compte dans TikTok Studio ou le Centre de Sécurité. Si une vidéo est inéligible au FYP, c'est indiqué dans ses stats.",
        cardType: "application",
      },
      {
        front:    "Quelles sont les causes les plus courantes de restriction ?",
        back:     "Violer les règles communautaires, utiliser de la musique sans droits, ne pas mettre le bon label sur une pub, utiliser de l'IA sans le signaler, ou acheter de faux abonnés.",
        cardType: "definition",
      },
      {
        front:    "Pourquoi acheter de faux abonnés est une mauvaise idée ?",
        back:     "TikTok supprime des millions de faux comptes chaque mois. Ça peut entraîner la suspension de ton compte. Et ça fausse tes stats sans apporter de vrais clients.",
        cardType: "application",
      },
      {
        front:    "Faut-il indiquer quand une vidéo est une publicité ?",
        back:     "Oui, c'est obligatoire. Si tu parles d'un produit en échange d'argent ou de cadeaux, tu dois activer le label 'contenu promotionnel'. Sans ça, la vidéo peut être supprimée.",
        cardType: "definition",
      },
      {
        front:    "Que faire si une vidéo est supprimée par erreur ?",
        back:     "Faire appel via l'app. Important : ne supprime pas la vidéo toi-même avant la fin de l'appel. Si tu la supprimes, TikTok ne peut plus corriger la sanction.",
        cardType: "application",
      },
      {
        front:    "Peut-on utiliser de l'IA dans ses vidéos TikTok ?",
        back:     "Oui, à condition de l'indiquer quand le contenu est réaliste (visage, voix, situation). Mettre le bon label n'affecte pas la distribution. Ne pas le mettre peut entraîner une suppression.",
        cardType: "definition",
      },
      {
        front:    "Comment TikTok modère-t-il les vidéos ?",
        back:     "D'abord un robot vérifie automatiquement. Si c'est ambigu, un humain regarde. En 2025, 93,8% des suppressions ont été faites sans intervention humaine.",
        cardType: "example",
      },
      {
        front:    "Quelle est la différence entre 'inéligible à la recommandation' et 'banni' ?",
        back:     "Inéligible = tes vidéos existent mais ne sont plus poussées. Banni = ton compte est totalement bloqué, tu ne peux plus du tout publier.",
        cardType: "comparison",
      },
      {
        front:    "Qu'est-ce que les 'Content Levels' sur TikTok ?",
        back:     "Au lieu de supprimer certains contenus sensibles mais autorisés, TikTok peut les restreindre aux adultes. C'est moins radical qu'une suppression totale.",
        cardType: "definition",
      },
    ],
  },
];

seed.get("/tiktok", async (c) => {
  // Récupérer l'utilisateur universel
  const user = await prisma.user.upsert({
    where:  { clerkId: "private" },
    create: { clerkId: "private", email: "owner@selmenlearn.app", name: "Apprenant" },
    update: {},
  });

  const results: { title: string; status: string; cards?: number }[] = [];

  for (const deckData of DECKS) {
    const existing = await prisma.deck.findFirst({
      where: { userId: user.id, title: deckData.title },
    });

    if (existing) {
      results.push({ title: deckData.title, status: "already_exists" });
      continue;
    }

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
          userId:     user.id,
          cardId:     card.id,
          nextReview: new Date(),
        },
      });
    }

    results.push({ title: deck.title, status: "created", cards: deckData.cards.length });
  }

  return c.json({ ok: true, results });
});

export default seed;
