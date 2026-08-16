import {
  useCreatePrivacyPolicyMutation,
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} from "../../../../redux/features/common/index.js";
import CommonContentEditor from "../common-content-editor.js";

export default function PrivacySettings() {
  const { data, isLoading } = useGetPrivacyPolicyQuery();
  const [createPrivacy, { isLoading: isCreating }] =
    useCreatePrivacyPolicyMutation();
  const [updatePrivacy, { isLoading: isUpdating }] =
    useUpdatePrivacyPolicyMutation();
  const document = data?.data?.[0];

  return (
    <CommonContentEditor
      title="Privacy Policy"
      description="Explain how GolfImprove collects, uses, and protects user information."
      document={document}
      isLoading={isLoading}
      isSaving={isCreating || isUpdating}
      onSave={async (id, content) => {
        if (id) {
          await updatePrivacy({ id, content }).unwrap();
        } else {
          await createPrivacy({ content }).unwrap();
        }
      }}
    />
  );
}
