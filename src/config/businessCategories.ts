export const BUSINESS_CATEGORIES = {
  retail: [
    { name: 'Vêtements', description: 'Vêtements pour hommes, femmes, enfants' },
    { name: 'Accessoires', description: 'Sacs, chaussures, bijoux' },
    { name: 'Beauté', description: 'Produits de beauté et soins' },
    { name: 'Électronique', description: 'Appareils électroniques divers' },
    { name: 'Maison', description: 'Articles pour la maison' },
    { name: 'Alimentaire', description: 'Produits alimentaires de base' }
  ],
  restaurant: [
    { name: 'Plats principaux', description: 'Plats chauds et repas complets' },
    { name: 'Entrées', description: 'Salades, soupes et entrées variées' },
    { name: 'Boissons', description: 'Toutes les boissons' },
    { name: 'Desserts', description: 'Desserts et pâtisseries' },
    { name: 'Alcool', description: 'Bières, vins et spiritueux' },
    { name: 'Menu enfant', description: 'Repas pour enfants' }
  ],
  bar: [
    { name: 'Boissons alcoolisées', description: 'Bières, vins, cocktails' },
    { name: 'Boissons non-alcoolisées', description: 'Jus, sodas, eaux' },
    { name: 'Snacks', description: 'Chips, noix, amuse-gueules' },
    { name: 'Cocktails', description: 'Cocktails variés' },
    { name: 'Café et thé', description: 'Boissons chaudes' },
    { name: 'Autres', description: 'Divers articles de bar' }
  ],
  pharmacy: [
    { name: 'Médicaments', description: 'Médicaments et pharmaceutiques' },
    { name: 'Produits hygiène', description: 'Produits d\'hygiène personnelle' },
    { name: 'Soins', description: 'Produits de soins corporels' },
    { name: 'Équipement médical', description: 'Matériel médical et paramédical' },
    { name: 'Vitamines', description: 'Compléments alimentaires et vitamines' },
    { name: 'Autres', description: 'Autres produits de pharmacie' }
  ],
  supermarket: [
    { name: 'Fruits et légumes', description: 'Produits frais' },
    { name: 'Boulangerie', description: 'Pain et viennoiseries' },
    { name: 'Produits laitiers', description: 'Lait, fromages, yaourts' },
    { name: 'Viandes et poissons', description: 'Produits frais et surgelés' },
    { name: 'Épicerie', description: 'Produits d\'épicerie secs' },
    { name: 'Boissons', description: 'Toutes les boissons' },
    { name: 'Produits ménagers', description: 'Entretien de la maison' },
    { name: 'Hygiène', description: 'Produits d\'hygiène' }
  ],
  hair_salon: [
    { name: 'Coupe homme', description: 'Coupes pour hommes' },
    { name: 'Coupe femme', description: 'Coupes pour femmes' },
    { name: 'Coloration', description: 'Services de coloration' },
    { name: 'Soins', description: 'Soins capillaires' },
    { name: 'Coiffage', description: 'Coiffage et mise en forme' },
    { name: 'Produits', description: 'Produits capillaires à vendre' }
  ],
  grocery: [
    { name: 'Céréales', description: 'Riz, pâtes, céréales diverses' },
    { name: 'Légumineuses', description: 'Haricots, pois, lentilles' },
    { name: 'Huiles et graisses', description: 'Huiles de cuisine' },
    { name: 'Épices', description: 'Épices et assaisonnements' },
    { name: 'Conserves', description: 'Produits en conserve' },
    { name: 'Boissons', description: 'Boissons diverses' }
  ],
  bar_restaurant: [
    { name: 'Plats principaux', description: 'Plats chauds et repas complets' },
    { name: 'Boissons alcoolisées', description: 'Bières, vins, cocktails' },
    { name: 'Boissons non-alcoolisées', description: 'Jus, sodas, eaux' },
    { name: 'Snacks et entrées', description: 'Amuse-gueules et entrées' },
    { name: 'Desserts', description: 'Desserts et pâtisseries' },
    { name: 'Cocktails', description: 'Cocktails variés' }
  ]
}

export const businessTypeLabels = {
  retail: 'Vente de produits et services',
  restaurant: 'Restaurant',
  bar: 'Bar',
  pharmacy: 'Pharmacie',
  supermarket: 'Supermarché',
  'hair_salon': 'Salon de coiffure',
  grocery: 'Épicerie',
  'bar_restaurant': 'Bar/Restaurant'
}

export function getCategoriesForBusinessType(businessType: string) {
  return BUSINESS_CATEGORIES[businessType as keyof typeof BUSINESS_CATEGORIES] || BUSINESS_CATEGORIES.retail
}
