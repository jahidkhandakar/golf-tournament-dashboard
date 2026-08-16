import React, { type ReactNode } from "react";
import {
    Form,
    Input,
    InputNumber,
    Select,
    Radio,
    Checkbox,
    DatePicker,
    Upload,
} from "antd";
import { UploadCloud } from "lucide-react";
import type { FormRule as Rule } from "antd";

const { TextArea } = Input;
const { Dragger } = Upload;

export type Option = {
    label: string;
    value: string | number;
    extraText?: string;
};

export interface FormFieldProps {
    /** The type of input field to render */
    type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "file-input"
    | "textarea"
    | "tel"
    | "date";
    /** The name of the field, used by antd Form for binding */
    name: string | (string | number)[];
    /** The label displayed above the field */
    label?: string;
    /** Placeholder text for text, email, password, number, textarea, and select */
    placeholder?: string;
    /** Optional icon to display alongside text-based inputs */
    icon?: ReactNode;
    /** Which side of the input the icon sits on (default "left") */
    iconPosition?: "left" | "right";
    /** antd validation rules */
    rules?: Rule[];
    /** Marks the field as required (adds a rule + asterisk) */
    required?: boolean;
    /** Options array for select and radio types */
    options?: Option[];
    /** Custom color classes for focus states */
    colorClass?: string;
    /** Additional custom classes for the input */
    className?: string;
    /** Whether to allow multiple file uploads (only for type="file") */
    multiple?: boolean;
    /** Accept attribute for file uploads (e.g. 'image/*') */
    accept?: string;
    rows?: number;
    fileUploadClass?: string;
    /** Default image to show in file dragger (when no file is selected) */
    defaultImage?: string | null | undefined;
}

// Normalize the Upload event into the file list antd Form expects
const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

type FileLineInputProps = {
    fileList?: any[];
    onChange?: (info: any) => void;
    placeholder?: string | undefined;
    accept?: string | undefined;
    icon?: ReactNode | undefined;
    className?: string | undefined;
};

const FileLineInput: React.FC<FileLineInputProps> = ({
    fileList,
    onChange,
    placeholder,
    accept,
    icon,
    className,
}) => {
    const fileName =
        Array.isArray(fileList) && fileList.length > 0 ? fileList[0]?.name : "";

    return (
        <Upload
            accept={accept as any}
            maxCount={1}
            showUploadList={false}
            beforeUpload={() => false}
            fileList={Array.isArray(fileList) ? fileList : []}
            {...(onChange !== undefined ? { onChange } : {})}
            className="w-full [&_.ant-upload-select]:!block [&_.ant-upload-select]:!w-full"
        >
            <Input
                readOnly
                value={fileName}
                placeholder={placeholder}
                suffix={icon}
                className={className}
                style={{ width: "100%", cursor: "pointer" }}
            />
        </Upload>
    );
};

const FileDraggerWrapper = ({ fileList, onChange, draggerName, multiple, accept, fileUploadClass, defaultImage, ...rest }: any) => {
    const hasFiles = Array.isArray(fileList) && fileList.length > 0;

    return (
        <Dragger
            name={draggerName}
            multiple={multiple}
            {...(multiple ? {} : { maxCount: 1 })}
            accept={accept as any}
            beforeUpload={() => false}
            listType="picture"
            className="!h-[360px]"
            rootClassName={fileUploadClass}
            fileList={fileList}
            onChange={onChange}
            showUploadList={!defaultImage} // Hide standard antd list if we are taking over preview rendering
            {...rest}
        >
            {defaultImage ? (
                <div className="flex flex-col items-center justify-center p-4">
                    <img src={defaultImage} alt="Preview" className="max-h-[250px] object-cover mb-4 rounded-lg" />
                    <p className="ant-upload-text">Click or drag new image to replace</p>
                </div>
            ) : (
                <>
                    <p className="flex justify-center">
                        <UploadCloud className="h-6 w-6 text-gray-400" />
                    </p>
                    <p className="ant-upload-text">
                        Click to upload or Drag &amp; drop or{" "}
                    </p>
                    <p className="ant-upload-hint">PDF, JPG, PNG - max 10 MB each</p>
                </>
            )}
        </Dragger>
    );
};

const FormField: React.FC<FormFieldProps> = ({
    type = "text",
    name,
    label,
    placeholder,
    icon,
    iconPosition = "left",
    rules = [],
    required = false,
    options = [],
    colorClass = "",
    className = "",
    multiple = false,
    accept,
    rows = 4,
    fileUploadClass = "",
    defaultImage,
}) => {
    const mergedRules: Rule[] = [
        ...rules,
        ...(required
            ? [{ required: true, message: `${label || "This field"} is required` }]
            : []),
    ];

    const controlClass =
        `${colorClass} ${className} !py-2.5 !px-6 !focus:outline-none !focus:ring-offset-0`.trim();

    const draggerName =
        typeof name === "string"
            ? name
            : Array.isArray(name)
                ? // Use the first element as a fallback string.
                // You can adjust this logic to suit your naming scheme.
                String(name[0])
                : "";

    const renderControl = () => {
        switch (type) {
            case "select":
                return (
                    <Select
                        placeholder={placeholder}
                        className={controlClass}
                        options={options.map((opt) => ({
                            value: opt.value,
                            label: opt.extraText ? (
                                <div className="flex flex-col">
                                    <span className="!font-semibold">{opt.label}</span>
                                    <span className="text-[10px] text-gray-500">
                                        {opt.extraText}
                                    </span>
                                </div>
                            ) : (
                                opt.label
                            ),
                        }))}
                    />
                );

            case "textarea":
                return (
                    <TextArea
                        rows={rows}
                        placeholder={placeholder}
                        className={controlClass}
                    />
                );

            case "radio":
                return (
                    <Radio.Group className={className}>
                        {options.map((opt) => (
                            <Radio key={opt.value} value={opt.value}>
                                {opt.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                );

            case "number":
                // InputNumber wraps an inner <input>; applying the vertical/horizontal
                // padding to the wrapper double-stacks its height vs. a plain Input.
                // Push the padding onto the inner input so it matches text fields.
                return (
                    <InputNumber
                        placeholder={placeholder}
                        prefix={icon}
                        controls={false}
                        className={`${colorClass} ${className} !w-full [&_.ant-input-number-input]:!h-auto [&_.ant-input-number-input]:!py-2.5 [&_.ant-input-number-input]:!px-6`.trim()}
                        style={{ width: "100%" }}
                    />
                );

            case "password":
                return (
                    <Input.Password
                        placeholder={placeholder}
                        prefix={icon}
                        className={controlClass}
                    />
                );

            case "date":
                return (
                    <DatePicker
                        {...(placeholder !== undefined ? { placeholder } : {})}
                        className={controlClass}
                        style={{ width: "100%" }}
                    />
                );

            default:
                // text, email, tel
                return (
                    <Input
                        type={type}
                        placeholder={placeholder}
                        prefix={iconPosition === "left" ? icon : undefined}
                        suffix={iconPosition === "right" ? icon : undefined}
                        className={controlClass}
                    />
                );
        }
    };

    // Checkbox binds its value via "checked"
    if (type === "checkbox") {
        return (
            <Form.Item
                name={name}
                valuePropName="checked"
                rules={mergedRules}
                className={className}
            >
                <Checkbox>{placeholder || label}</Checkbox>
            </Form.Item>
        );
    }

    // Single-line file picker styled like a text input
    if (type === "file-input") {
        return (
            <Form.Item
                name={name}
                label={label}
                required={required}
                rules={mergedRules}
                valuePropName="fileList"
                getValueFromEvent={normFile}
                className={className}
            >
                <FileLineInput
                    placeholder={placeholder}
                    accept={accept}
                    icon={icon}
                    className={controlClass}
                />
            </Form.Item>
        );
    }

    // File upload uses a dragger and a file-list value
    if (type === "file") {
        return (
            <Form.Item
                name={name}
                label={label}
                required={required}
                rules={mergedRules}
                valuePropName="fileList"
                getValueFromEvent={normFile}
                className={className}
            >
                <Dragger
                    name={draggerName}
                    multiple={multiple}
                    {...(multiple ? {} : { maxCount: 1 })}
                    accept={accept as any}
                    beforeUpload={() => false}
                    listType="picture"
                    className="!h-[360px]"
                    rootClassName={fileUploadClass}
                >
                    <p className="flex justify-center">
                        <UploadCloud className="h-6 w-6 text-gray-400" />
                    </p>
                    <p className="ant-upload-text">
                        Click to upload or Drag &amp; drop or{" "}
                    </p>
                    <p className="ant-upload-hint">PDF, JPG, PNG - max 10 MB each</p>
                </Dragger>
            </Form.Item>
        );
    }

    return (
        <Form.Item
            name={name}
            label={label}
            required={required}
            rules={mergedRules}
            className={className}
        >
            {renderControl()}
        </Form.Item>
    );
};

export default FormField;