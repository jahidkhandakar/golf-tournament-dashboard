import { useEffect, useState, type ComponentType } from "react";
import { Clock3, Edit3, FileText, Save, X } from "lucide-react";
import { Spin, message } from "antd";
import SunEditorImport from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import type { CommonContent } from "../../../redux/features/common/index.js";

type SunEditorProps = {
  setContents?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  height?: string;
  setDefaultStyle?: string;
  setOptions?: Record<string, unknown>;
};

const SunEditor = ((SunEditorImport as any)?.default ??
  SunEditorImport) as unknown as ComponentType<SunEditorProps>;

type CommonContentEditorProps = {
  title: string;
  description: string;
  document?: CommonContent;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (id: string | undefined, content: string) => Promise<void>;
};

export default function CommonContentEditor({
  title,
  description,
  document,
  isLoading,
  isSaving,
  onSave,
}: CommonContentEditorProps) {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setContent(document?.content ?? "");
  }, [document]);

  const plainTextContent = content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  const handleSave = async () => {
    if (plainTextContent.length < 5) {
      message.warning("Content must be at least 5 characters long.");
      return;
    }

    try {
      await onSave(document?._id, content.trim());
      message.success(`${title} saved successfully.`);
      setIsEditing(false);
    } catch (error) {
      message.error(
        (error as any)?.data?.message ?? `Unable to save ${title.toLowerCase()}.`,
      );
    }
  };

  const cancelEditing = () => {
    setContent(document?.content ?? "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500">
            <Clock3 className="h-3.5 w-3.5" />
            {document?.published
              ? `Updated ${document.published}`
              : "Not published yet"}
          </span>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <Edit3 className="h-4 w-4" />
              {document ? "Edit Content" : "Add Content"}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Page Content
              </label>
              <span className="text-[11px] text-gray-400">
                Rich HTML formatting is supported
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white [&_.sun-editor]:border-0">
              <SunEditor
                setContents={content}
                onChange={setContent}
                placeholder={`Write the ${title.toLowerCase()} content here...`}
                height="420px"
                setDefaultStyle="font-family: Inter, Arial, sans-serif; font-size: 15px; line-height: 1.7;"
                setOptions={{
                  resizingBar: true,
                  showPathLabel: false,
                  charCounter: true,
                  charCounterLabel: "Characters",
                  buttonList: [
                    ["undo", "redo"],
                    ["font", "fontSize", "formatBlock"],
                    ["bold", "underline", "italic", "strike"],
                    ["fontColor", "hiliteColor"],
                    ["align", "list", "lineHeight"],
                    ["outdent", "indent"],
                    ["table", "link"],
                    ["removeFormat", "showBlocks", "codeView", "fullScreen"],
                  ],
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Changes become available to users immediately after saving.
              </p>
              <span className="text-[11px] font-medium text-gray-400">
                {plainTextContent.length.toLocaleString()} text characters
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={plainTextContent.length < 5 || isSaving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : document ? "Save Changes" : "Publish"}
            </button>
          </div>
        </>
      ) : document?.content ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 md:p-8">
          <div
            className="sun-editor-editable min-h-[320px] !bg-transparent !p-0"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </div>
      ) : (
        <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 text-center">
          <FileText className="h-10 w-10 text-gray-300" />
          <h3 className="mt-4 text-sm font-bold text-gray-700">
            No content published yet
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
            Select Add Content above to create and publish this section.
          </p>
        </div>
      )}
    </div>
  );
}
