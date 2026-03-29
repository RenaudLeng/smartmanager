import { BusinessSystem } from '@/types/business'

export const businessSystems: Record<string, BusinessSystem> = {
  bar: {
    type: 'bar',
    features: [
      'Gestion des consommations (bières, vins, cocktails locaux)',
      'Contrôle des heures de fermeture réglementaires',
      'Gestion des zones (bar intérieur, terrasse, espace extérieur)',
      'Suivi des stocks de boissons locales et importées',
      'Gestion des fournisseurs gabonais et internationaux',
      'Système de musique et animations',
      'Gestion des événements spéciaux (matchs, fêtes)',
      'Contrôle du bruit et respect du voisinage'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: false,
      tables: true,
      prescriptions: false,
      insurance: false,
      delivery: false,
      fidelity: true,
      multipleCheckout: false,
      localBeverages: true,
      eventManagement: true,
      noiseControl: true
    },
    reports: [
      'Ventes par type de boissons (locales vs importées)',
      'Fréquentation par heure et par jour',
      'Performance des animations et événements',
      'Consommation pendant les matchs sportifs',
      'Rentabilité par zone et par heure',
      'Analyse des fournisseurs locaux',
      'Contrôle des heures de fermeture'
    ],
    specificFields: [
      'type_biere_locale',
      'fournisseur_local',
      'heure_fermeture_legale',
      'zone_animation',
      'type_evenement',
      'volume_consommation'
    ]
  },
  
  pharmacy: {
    type: 'pharmacy',
    features: [
      'Gestion des médicaments avec contrôle CNAM',
      'Gestion des ordonnances et assurances gabonaises',
      'Contrôle des produits pharmaceutiques importés',
      'Conseils pharmaceutiques adaptés au contexte local',
      'Gestion des mutuelles (CNAM, privées)',
      'Alertes sur les médicaments périmés',
      'Statistiques de santé publique locale',
      'Gestion des produits traditionnels approuvés'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: true,
      tables: false,
      prescriptions: true,
      insurance: true,
      delivery: true,
      fidelity: false,
      multipleCheckout: false,
      cnamIntegration: true,
      localProducts: true,
      healthStats: true
    },
    reports: [
      'Médicaments couverts par la CNAM',
      'Produits importés vs produits locaux',
      'Statistiques de maladies locales',
      'Performance des mutuelles gabonaises',
      'Médicaments les plus prescrits',
      'Alertes réglementaires gabonaises',
      'Analyse des produits de parapharmacie'
    ],
    specificFields: [
      'code_cnams',
      'couverture_assurance',
      'origine_medicament',
      'autorisation_medicament_gabon',
      'mutuelle_gabonaise',
      'produit_traditionnel_approuve'
    ]
  },
  
  hair_salon: {
    type: 'hair_salon',
    features: [
      'Gestion des rendez-vous avec créneaux flexibles',
      'Services adaptés aux cheveux africains',
      'Vente de produits capillaires locaux et importés',
      'Gestion des tresses, coiffures traditionnelles',
      'Planning des coiffeurs par spécialité',
      'Fidélisation et programme de fidélité',
      'Gestion des colorations et défrisages',
      'Services pour événements spéciaux (mariages)'
    ],
    modules: {
      inventory: true,
      orders: false,
      appointments: true,
      tables: false,
      prescriptions: false,
      insurance: false,
      delivery: false,
      fidelity: true,
      multipleCheckout: false,
      africanHairSpecialist: true,
      eventServices: true,
      localProducts: true
    },
    reports: [
      'Services les plus demandés (tresses, défrisages)',
      'Performance des coiffeurs par spécialité',
      'Ventes de produits locaux vs importés',
      'Fréquentation par heure et par saison',
      'Rendez-vous pour événements spéciaux',
      'Satisfaction clients et avis',
      'Analyse des créneaux horaires'
    ],
    specificFields: [
      'type_coiffure_africaine',
      'marque_produit_local',
      'duree_service_special',
      'type_evenement_client',
      'texture_cheveux',
      'produit_utilise_local'
    ]
  },
  
  restaurant: {
    type: 'restaurant',
    features: [
      'Gestion des tables avec capacité adaptée',
      'Menu gabonais et international',
      'Gestion des livraisons à Libreville et environs',
      'Contrôle qualité des produits locaux',
      'Gestion des réservations pour groupes',
      'Menu du jour et formules locales',
      'Gestion des heures de pointe (déjeuner, dîner)',
      'Animation musicale et ambiance'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: true,
      tables: true,
      prescriptions: false,
      insurance: false,
      delivery: true,
      fidelity: true,
      multipleCheckout: false,
      localCuisine: true,
      deliveryZones: true,
      peakHours: true
    },
    reports: [
      'Plats gabonais les plus populaires',
      'Performance des livraisons par zone',
      'Rotation des tables aux heures de pointe',
      'Analyse des produits locaux utilisés',
      'Performance des formules du jour',
      'Rentabilité par type de cuisine',
      'Fréquentation par jour de semaine'
    ],
    specificFields: [
      'type_plat_local',
      'zone_livraison_libreville',
      'produit_fournisseur_local',
      'heure_pointe',
      'formule_jour',
      'type_animation'
    ]
  },
  
  supermarket: {
    type: 'supermarket',
    features: [
      'Gestion des produits locaux et importés',
      'Multi-caisses adaptées au volume gabonais',
      'Promotions et programmes de fidélité',
      'Gestion des rayons (produits africains, importés)',
      'Réapprovisionnement avec fournisseurs locaux',
      'Contrôle des pertes et démarque',
      'Gestion des heures de pointe',
      'Services adaptés (transfert d\'argent, paiement factures)'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: false,
      tables: false,
      prescriptions: false,
      insurance: false,
      delivery: true,
      fidelity: true,
      multipleCheckout: true,
      localProducts: true,
      financialServices: true,
      peakHours: true
    },
    reports: [
      'Ventes de produits locaux vs importés',
      'Performance des caisses par heure',
      'Analyse des promotions gabonaises',
      'Fréquentation par jour et par heure',
      'Rentabilité par rayon',
      'Performance des services financiers',
      'Analyse des fournisseurs locaux'
    ],
    specificFields: [
      'origine_produit',
      'fournisseur_gabonais',
      'rayon_produit_africain',
      'type_service_financier',
      'heure_affluence',
      'promotion_locale'
    ]
  },
  
  retail: {
    type: 'retail',
    features: [
      'Gestion des produits locaux et importés',
      'Vente adaptée au pouvoir d\'achat local',
      'Gestion des fournisseurs gabonais',
      'Promotions adaptées au marché gabonais',
      'Fidélisation de la clientèle locale',
      'Gestion des crédits clients',
      'Statistiques de ventes par quartier',
      'Gestion des saisons (sèche, des pluies)'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: false,
      tables: false,
      prescriptions: false,
      insurance: false,
      delivery: false,
      fidelity: true,
      multipleCheckout: false,
      localProducts: true,
      creditManagement: true,
      seasonalManagement: true
    },
    reports: [
      'Ventes par quartier de Libreville',
      'Performance des produits locaux',
      'Analyse des crédits clients',
      'Saisonalité des ventes',
      'Performance des fournisseurs gabonais',
      'Rentabilité par catégorie',
      'Évolution de la clientèle'
    ],
    specificFields: [
      'quartier_client',
      'produit_fabrique_gabon',
      'type_credit_client',
      'saison_vente',
      'fournisseur_local',
      'categorie_prix_achat'
    ]
  },

  grocery: {
    type: 'grocery',
    features: [
      'Gestion des produits alimentaires de base au Gabon',
      'Contrôle des produits frais et locaux',
      'Fournisseurs locaux et marchés gabonais',
      'Vente en gros et au détail adaptée',
      'Gestion des crédits clients de quartier',
      'Produits importés vs produits locaux',
      'Gestion des saisons et disponibilités',
      'Statistiques de consommation locale'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: false,
      tables: false,
      prescriptions: false,
      insurance: false,
      delivery: false,
      fidelity: true,
      multipleCheckout: false,
      localSupply: true,
      creditManagement: true,
      seasonalProducts: true
    },
    reports: [
      'Ventes de produits locaux vs importés',
      'Performance des fournisseurs gabonais',
      'Analyse des crédits clients par quartier',
      'Disponibilité saisonnière des produits',
      'Consommation moyenne par famille',
      'Rentabilité par type de produit',
      'Analyse des pertes et périmés'
    ],
    specificFields: [
      'marche_fournisseur',
      'produit_saisonnier_gabon',
      'type_credit_epicerie',
      'zone_livraison_quartier',
      'origine_produit_local',
      'conditionnement_adapte'
    ]
  },

  bar_restaurant: {
    type: 'bar_restaurant',
    features: [
      'Menu restaurant avec spécialités gabonaises',
      'Carte de boissons locales et internationales',
      'Service mixte bar et restaurant',
      'Gestion des animations et événements',
      'Contrôle des heures de fermeture',
      'Personnel polyvalent formé',
      'Gestion des zones (intérieur, terrasse, VIP)',
      'Livraison dans les quartiers de Libreville'
    ],
    modules: {
      inventory: true,
      orders: true,
      appointments: true,
      tables: true,
      prescriptions: false,
      insurance: false,
      delivery: true,
      fidelity: true,
      multipleCheckout: false,
      localCuisine: true,
      localBeverages: true,
      eventManagement: true,
      deliveryZones: true
    },
    reports: [
      'Performance plats gabonais vs boissons',
      'Rentabilité par zone et par heure',
      'Analyse des événements et animations',
      'Performance des livraisons par quartier',
      'Optimisation du personnel polyvalent',
      'Contrôle des heures de fermeture',
      'Analyse des fournisseurs locaux'
    ],
    specificFields: [
      'specialite_gabonaise',
      'boisson_locale',
      'type_evenement_programme',
      'zone_livraison_libreville',
      'animation_type',
      'heure_fermeture_controlee'
    ]
  }
}

export const getBusinessSystem = (businessType: string): BusinessSystem => {
  return businessSystems[businessType] || businessSystems.retail
}

export const getAvailableModules = (businessType: string) => {
  const system = getBusinessSystem(businessType)
  return Object.entries(system.modules)
    .filter(([_, enabled]) => enabled)
    .map(([module, _]) => module)
}

export const getBusinessReports = (businessType: string) => {
  const system = getBusinessSystem(businessType)
  return system.reports
}
