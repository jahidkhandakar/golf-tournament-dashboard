import {
  useCreateTermsMutation,
  useGetTermsQuery,
  useUpdateTermsMutation,
} from "../../../../redux/features/common/index.js";
import CommonContentEditor from "../common-content-editor.js";

export default function TermsSettings() {
  const { data, isLoading } = useGetTermsQuery();
  const [createTerms, { isLoading: isCreating }] = useCreateTermsMutation();
  const [updateTerms, { isLoading: isUpdating }] = useUpdateTermsMutation();
  const document = data?.data?.[0];

  return (
    <CommonContentEditor
      title="Terms & Conditions"
      description="Manage the terms users agree to when accessing GolfImprove."
      document={document}
      isLoading={isLoading}
      isSaving={isCreating || isUpdating}
      onSave={async (id, content) => {
        if (id) {
          await updateTerms({ id, content }).unwrap();
        } else {
          await createTerms({ content }).unwrap();
        }
      }}
    />
  );
}
