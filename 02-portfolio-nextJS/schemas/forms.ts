import { z } from 'zod/v4';

export const PublicationFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  type: z.enum(['article', 'tutoriel', 'note'], { message: 'Type invalide' }),
  contenu: z.string().min(1, 'Le contenu est requis'),
  contenu_json: z.string().optional(),
  contenu_html: z.string().optional(),
  extrait: z.string().max(500).optional().nullable(),
  image_couverture: z.string().optional().nullable(),
  est_publie: z.boolean(),
  domaines: z.array(z.number()).optional(),
});

export type PublicationFormData = z.infer<typeof PublicationFormSchema>;

export const ProjetFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().min(1, 'La description est requise'),
  courte_description: z.string().max(300).optional().nullable(),
  technologies: z.array(z.string()).optional().nullable(),
  date_realisation: z.string().optional().nullable(),
  url_demo: z.string().url('URL invalide').max(500).optional().nullable().or(z.literal('')),
  url_code: z.string().url('URL invalide').max(500).optional().nullable().or(z.literal('')),
  image_couverture: z.string().optional().nullable(),
  est_publie: z.boolean(),
  est_en_vedette: z.boolean().optional(),
});

export type ProjetFormData = z.infer<typeof ProjetFormSchema>;

export const ExperienceFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  entreprise: z.string().min(1, "L'entreprise est requise").max(255),
  description: z.string().optional().nullable(),
  lieu: z.string().max(255).optional().nullable(),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().optional().nullable(),
  est_actuel: z.boolean(),
  ordre: z.number().optional().nullable(),
});

export type ExperienceFormData = z.infer<typeof ExperienceFormSchema>;

export const FormationFormSchema = z.object({
  diplome: z.string().min(1, 'Le diplôme est requis').max(255),
  etablissement: z.string().min(1, "L'établissement est requis").max(255),
  description: z.string().optional().nullable(),
  domaine: z.string().max(255).optional().nullable(),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().optional().nullable(),
  ordre: z.number().optional().nullable(),
});

export type FormationFormData = z.infer<typeof FormationFormSchema>;

export const CertificationFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  organisme: z.string().min(1, "L'organisme est requis").max(255),
  description: z.string().optional().nullable(),
  date_obtention: z.string().min(1, "La date d'obtention est requise"),
  date_expiration: z.string().optional().nullable(),
  ordre: z.number().optional().nullable(),
});

export type CertificationFormData = z.infer<typeof CertificationFormSchema>;

export const CompetenceFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(255),
  categorie: z.string().max(255).optional().nullable(),
  icone: z.string().max(255).optional().nullable(),
  niveau: z.enum(['debutant', 'intermediaire', 'avance', 'expert']).optional().nullable(),
  est_surligne: z.boolean().optional(),
});

export type CompetenceFormData = z.infer<typeof CompetenceFormSchema>;

export const DomaineFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(255),
  description: z.string().optional().nullable(),
  couleur: z.string().max(7).optional().nullable(),
});

export type DomaineFormData = z.infer<typeof DomaineFormSchema>;

export const EvenementFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional().nullable(),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().optional().nullable(),
  lieu: z.string().max(255).optional().nullable(),
  couleur: z.string().max(7).optional().nullable(),
  est_journee_complete: z.boolean().optional(),
  statut: z.enum(['planifie', 'confirme', 'annule', 'termine']).optional(),
  emploi_du_temps_id: z.number().optional().nullable(),
});

export type EvenementFormData = z.infer<typeof EvenementFormSchema>;

export const EdtFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional().nullable(),
  type: z.string().max(50).optional().nullable(),
  est_actif: z.boolean().optional(),
});

export type EdtFormData = z.infer<typeof EdtFormSchema>;

export const RappelFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  message: z.string().optional().nullable(),
  evenement_id: z.number().optional().nullable(),
});

export type RappelFormData = z.infer<typeof RappelFormSchema>;

export const RessourceFormSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional().nullable(),
  est_publique: z.boolean().optional(),
  domaine_id: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().optional()
  ).nullable(),
});

export type RessourceFormData = z.infer<typeof RessourceFormSchema>;

export const ContactFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(255),
  email: z.string().email('Email invalide').max(255),
  sujet: z.string().max(255).optional().nullable(),
  message: z.string().min(10, 'Le message doit faire au moins 10 caractères').max(5000),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

export const ProfileFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  bio: z.string().optional().nullable(),
  titre_professionnel: z.string().max(255).optional().nullable(),
  localisation: z.string().max(255).optional().nullable(),
  site_web: z.string().url('URL invalide').optional().nullable().or(z.literal('')),
  url_linkedin: z.string().url('URL invalide').optional().nullable().or(z.literal('')),
  url_github: z.string().url('URL invalide').optional().nullable().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;

export const CommentaireFormSchema = z.object({
  contenu: z.string().min(2, 'Minimum 2 caractères').max(2000, 'Maximum 2000 caractères'),
  commentable_id: z.number(),
  commentable_type: z.enum(['publications', 'projets']),
});

export type CommentaireFormData = z.infer<typeof CommentaireFormSchema>;
