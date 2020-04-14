const linxoCategories = {
    "Non-Catégorisées": ["Chèque", "Retrait d'espèces", "Virements non catégorisés", "Autres : Non-Catégorisées"],
    "Revenus": ["Aides et allocations", "Cadeaux, dons reçus", "Dividendes", "Intérêts", "Retraite", "Revenus complémentaires", "Revenus de remplacement", "Revenus locatifs", "Salaire / Revenus d'activité", "Autres : Revenus"],
    "Dépenses vie courante": ["Alimentation, supermarché", "Animaux", "Cadeaux offerts", "Coiffeur, esthétique, cosmétique, soins", "Dons caritatifs", "Habillement", "Internet, TV, télécom", "Remb. prêt conso", "Shopping / e - Commerce", "Snacks, repas au travail", "Tabac / Presse", "Autres : Dépenses vie courante"],
    "Education, formation": ["Cours, soutien scolaire", "Inscription, scolarité", "Livres, fournitures(éducation)", "Remb. prêt étudiant", "Autres : Education, formation"],
    "Enfants": ["Activités enfants", "Argent de poche", "Assurance scolaire", "Garde d'enfants", "Jouets, cadeaux", "Pension versée", "Restauration scolaire", "Autres : Enfants"],
    "Impôts": ["Contributions sociales", "Impôts sur le revenu", "ISF", "Taxes foncières, d'habitation", "Autres : Impôts"],
    "Logement, immobilier": ["Assurance logement", "Charges logement", "Eau", "Electricité, gaz, chauffage", "Loyer", "Meubles, équipement", "Remb. prêt immobilier", "Travaux, déco, jardin", "Autres : Logement, immobilier"],
    "Santé, prévoyance": ["Cotis mutuelle, prévoyance", "Frais, remb santé", "Autres : Santé, prévoyance"],
    "Services": ["Aide - à - domicile", "Conseil financier", "Conseil juridique", "Frais bancaires", "Poste, courrier", "Autres : Services"],
    "Sorties, voyages": ["Avion / train / bateau...", "Restaurants, soirées", "Sorties culturelles", "Sorties détente", "Voyages", "Autres : Sorties, voyages"],
    "Sports, loisirs": ["Cotis.sports, loisirs", "Cours sports, loisirs", "Electronique, multimédia", "Equipement sports, loisirs", "Musique, livres, films", "Passion, hobby", "Autres : Sports, loisirs"],
    "Transports, véhicules": ["Achat véhicule", "Assurance véhicule", "Carburant", "Entretien, équipements véhicules", "Garage, parking privé", "Location véhicule", "Parking, péages, PV", "Remb. prêt véhicule", "Taxi", "Transports en commun", "Autres : Transports, véhicules"],
    "Hors budget": ["Achats, ventes de titres", "Avances, remboursements", "Déblocage prêt, crédits, réserves", "Notes de frais(+/-)", "Prél.carte débit différé", "Virements d'épargne", "Virements internes", "Autres : Hors budget"]
};
const flatLinxoCategories = [];
Object.entries(linxoCategories).forEach(([parent, children]) => {
    flatLinxoCategories.push({label: parent, isParent: true});
    children.forEach(label => flatLinxoCategories.push({label}));
});

export default flatLinxoCategories;