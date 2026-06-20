export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface ProfilePublic {
  nom: string;
  email: string | null;
  photo: string | null;
  titre_professionnel: string | null;
  bio: string | null;
  localisation: string | null;
  site_web: string | null;
  url_linkedin: string | null;
  url_github: string | null;
  updated_at: string | null;
  competences: Competence[];
  domaines: Domaine[];
  experiences: Experience[];
  formations: Formation[];
  certifications: Certification[];
}

export interface Competence {
  id: number;
  nom: string;
  categorie: string | null;
  icone: string | null;
  niveaux: NiveauCompetence[];
}

export interface NiveauCompetence {
  id: number;
  niveau: string;
  est_surligne: boolean;
}

export interface Domaine {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  couleur: string | null;
  publications_count?: number;
  ressources_count?: number;
}

export interface MediaQualification {
  id: number;
  qualifiable_type: string;
  qualifiable_id: number;
  type: string;
  chemin_fichier: string;
  titre: string | null;
  taille: number | null;
  ordre: number;
}

export interface Experience {
  id: number;
  titre: string;
  entreprise: string;
  description: string | null;
  date_debut: string;
  date_fin: string | null;
  est_actuel: boolean;
  lieu: string | null;
  ordre: number;
  medias: MediaQualification[];
}

export interface Formation {
  id: number;
  diplome: string;
  etablissement: string;
  description: string | null;
  domaine_etude: string | null;
  date_debut: string;
  date_fin: string | null;
  medias: MediaQualification[];
}

export interface Certification {
  id: number;
  titre: string;
  organisme: string;
  description: string | null;
  date_obtention: string;
  date_expiration: string | null;
  url_credential: string | null;
  medias: MediaQualification[];
}

export interface Projet {
  id: number;
  titre: string;
  slug: string;
  description: string;
  courte_description: string | null;
  technologies: string[] | null;
  url_demo: string | null;
  url_code: string | null;
  image_couverture: string | null;
  est_en_vedette: boolean;
  date_realisation: string | null;
  publie_le: string | null;
  est_publie: boolean;
  nombre_vues?: number;
  medias: ProjetMedia[];
  likes?: Like[];
  commentaires?: Commentaire[];
}

export interface MediaPublication {
  id: number;
  type: string;
  chemin_fichier: string;
  taille: number | null;
  largeur: number | null;
  hauteur: number | null;
  titre: string | null;
  ordre: number;
}

export interface ProjetMedia {
  id: number;
  type: string;
  chemin_fichier: string;
  url_externe: string | null;
  vignette: string | null;
  titre: string | null;
  est_principal: boolean;
  ordre: number;
}

export interface Publication {
  id: number;
  titre: string;
  slug: string;
  type: string;
  contenu: string;
  contenu_html?: string;
  contenu_json?: Record<string, unknown>;
  extrait: string | null;
  image_couverture: string | null;
  publie_le: string | null;
  est_publie: boolean;
  nombre_vues?: number;
  domaines: Domaine[];
  commentaires: Commentaire[];
  likes: Like[];
  medias: MediaPublication[];
}

export interface Commentaire {
  id: number;
  contenu: string;
  est_approuve: boolean;
  created_at: string;
  auteur: { id: number; nom: string };
  commentable: { id: number; titre?: string; slug?: string } | null;
  commentable_type: string;
  commentable_id: number;
  parent_id: number | null;
}

export interface Like {
  id: number;
  auteur_id: number;
}

export interface Contact {
  id: number;
  nom: string;
  email: string;
  sujet: string | null;
  message: string;
  est_lu: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  titre: string;
  message: string | null;
  type: string;
  est_lue: boolean;
  created_at: string;
}

export interface Ressource {
  id: number;
  titre: string;
  description: string | null;
  est_publique: boolean;
  created_at: string;
  domaine: Domaine | null;
  media?: MediaQualification[];
}

export interface Rappel {
  id: number;
  titre: string;
  message: string | null;
  est_notifie: boolean;
  notifie_le: string | null;
  created_at: string;
  evenement: Evenement | null;
}

export interface Evenement {
  id: number;
  titre: string;
  date_debut: string;
  date_fin: string | null;
  statut: string;
  couleur: string | null;
  lieu: string | null;
  emploi_du_temps_id: number;
}

export interface EmploiDuTemps {
  id: number;
  titre: string;
  description: string | null;
  type: string;
  est_actif: boolean;
  evenements: Evenement[];
}

export interface Conversion {
  id: number;
  titre: string;
  url_externe: string | null;
  fichier: string | null;
  type: string | null;
  resultat_json: string | null;
  created_at: string;
  evenement: Evenement | null;
}

export interface Stats {
  vues_par_jour: { date: string; total: number }[];
  top_publications: { id: number; titre: string; slug: string; likes_count: number; commentaires_count: number; vuepages_count: number }[];
  top_projets: { id: number; titre: string; slug: string; likes_count: number; commentaires_count: number; vuepages_count: number }[];
  totaux: {
    vues: number;
    publications: number;
    projets: number;
    likes: number;
    messages_non_lus: number;
    commentaires_en_attente: number;
  };
}

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  photo: string | null;
  email_verifie_le: string | null;
  derniere_connexion_le: string | null;
  proprietaire: Proprietaire | null;
}

export interface Proprietaire {
  id: number;
  utilisateur_id: number;
  bio: string | null;
  titre_professionnel: string | null;
  localisation: string | null;
  site_web: string | null;
  url_linkedin: string | null;
  url_github: string | null;
  created_at: string;
  updated_at: string;
}