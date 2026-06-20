// Re-exports from per-entity hook files for backward compatibility
export { useContactForm, useReadContact, useDeleteContact } from './use-contacts';
export { useCreateCommentaire, useApprouverCommentaire, useRejeterCommentaire, useUpdateCommentaire, useDeleteCommentaire } from './use-commentaires';
export { useToggleLike } from './use-like';
export { useCreateProjet, useUpdateProjet, useDeleteProjet } from './use-projets';
export { useCreatePublication, useUpdatePublication, useDeletePublication } from './use-publications';
export { useCreateDomaine, useUpdateDomaine, useDeleteDomaine } from './use-domaines';
export { useCreateCompetence, useDeleteCompetence, useUpdateCompetence } from './use-competences';
export { useCreateRessource, useUpdateRessource, useDeleteRessource, useCreateRessourceMedia } from './use-ressources';
export { useCreateRappel, useDeleteRappel, useUpdateRappel } from './use-rappels';
export { useCreateEdt, useToggleEdt, useDeleteEdt, useCreateEvenement, useUpdateEvenement, useDeleteEvenement, useEdtImport } from './use-edt';
export { useReadNotification, useReadAllNotifications, useDeleteNotification } from './use-notifications';
export { useUpdateProfile } from './useProfile';
export { useCreateExperience, useUpdateExperience, useDeleteExperience } from './use-experiences';
export { useCreateFormation, useUpdateFormation, useDeleteFormation } from './use-formations';
export { useCreateCertification, useUpdateCertification, useDeleteCertification } from './use-certifications';
export { useImportConversion } from './use-conversions';
