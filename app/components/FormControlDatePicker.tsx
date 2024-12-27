import {
  Controller,
  useFormContext,
  ControllerProps,
  FieldValues,
  Path,
  Control,
} from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface FormControlDatePickerProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  control: Control<TFormValues>;
  controllerProps?: Partial<ControllerProps>;
  isInvalid?: boolean;
}

/**
 * Date picker component for react-hook-form
 */
export default function FormControlDatePickerr<
  TFormValues extends FieldValues
>({
  name,
  control,
  isInvalid,
  ...controllerProps
}: FormControlDatePickerProps<TFormValues>) {
  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field: { onChange, value } }) => (
        <DatePicker
          className={`form-control ${isInvalid ? "is-invalid" : ""}`}
          wrapperClassName={`form-control`}
          toggleCalendarOnIconClick
          onChange={onChange}
          selected={value}
          showIcon
          showTimeSelect
          dateFormat="MM/dd/yyyy h:mm aa"
          timeFormat="h:mm aa"
          timeIntervals={15}
        />
      )}
    />
  );
}
