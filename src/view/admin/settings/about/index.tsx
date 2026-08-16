import {
  useCreateAboutMutation,
  useGetAboutQuery,
  useUpdateAboutMutation,
} from "../../../../redux/features/common/index.js";
import CommonContentEditor from "../common-content-editor.js";

export default function AboutSettings() {
  const { data, isLoading } = useGetAboutQuery();
  const [createAbout, { isLoading: isCreating }] = useCreateAboutMutation();
  const [updateAbout, { isLoading: isUpdating }] = useUpdateAboutMutation();
  const document = data?.data?.[0];

  return (
    <CommonContentEditor
      title="About Us"
      description="Tell users about GolfImprove, your mission, and the team behind the platform."
      document={document}
      isLoading={isLoading}
      isSaving={isCreating || isUpdating}
      onSave={async (id, content) => {
        if (id) {
          await updateAbout({ id, content }).unwrap();
        } else {
          await createAbout({ content }).unwrap();
        }
      }}
    />
  );
}
