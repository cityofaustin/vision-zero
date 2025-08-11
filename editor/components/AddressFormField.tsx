import { Form } from "react-bootstrap";
import { useLookupQuery } from "@/utils/graphql";
import { useQuery } from "@/utils/graphql";
import { LookupTableOption } from "@/types/relationships";
import { AddressFormInputs } from "@/components/EditCrashAddressModal";
import { Relationship } from "@/types/relationships";
import { UseFormRegister } from "react-hook-form";
import { Spinner } from "react-bootstrap";

interface AddressFormFieldProps {
  /**
   * These props are pulled from the crashesColumns config
   */
  col: {
    path: keyof AddressFormInputs; // Ensures the path matches one of the AddressInputs keys
    label: string;
    inputType: "text" | "number" | "select";
    relationship?: Relationship<Record<string, unknown>>; // Optional since it's conditionally used
  };
  /**
   * This method comes from RHF useForm()
   */
  register: UseFormRegister<AddressFormInputs>;
}

/**
 * Component for the address modal that that renders a reach hook form field based on the input type
 * of the column, such as text or select
 */
export default function AddressFormField({
  col,
  register,
}: AddressFormFieldProps) {
  const [query, typename] = useLookupQuery(
    col?.relationship ? col.relationship : undefined
  );

  const {
    data: selectOptions,
    error: selectOptionsError,
    isLoading: isLoadingSelectOptions,
  } = useQuery<LookupTableOption>({
    query,
    // we don't need to refetch lookup table options
    options: { revalidateIfStale: false },
    typename,
  });
  const inputType = col.inputType;

  return (
    <div className="mb-2">
      {(inputType === "text" || inputType === "number") && (
        <Form.Control
          {...register(col.path, {
            setValueAs: (value) => value?.trim() || null,
            onChange: (e) => (e.target.value = e.target.value.toUpperCase()), // uppercase input as user is typing
          })}
          size="sm"
          type="text"
          inputMode={inputType === "number" ? "numeric" : undefined}
          data-1p-ignore
        />
      )}
      {isLoadingSelectOptions && <Spinner size="sm" />}
      {inputType === "select" && (selectOptions || !!selectOptionsError) && (
        <Form.Select
          {...register(col.path, {
            setValueAs: (value) => (value === "" ? null : value),
          })}
          size="sm"
          disabled={!selectOptions}
          isInvalid={!!selectOptionsError}
        >
          <option value="">Select...</option>
          {selectOptions?.map((option) => (
            <option key={option.id} value={String(option.id)}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      )}
      {/* Lookup option error message*/}
      {!!selectOptionsError && (
        <Form.Control.Feedback type="invalid">
          Failed to retrieve menu options
        </Form.Control.Feedback>
      )}
    </div>
  );
}
