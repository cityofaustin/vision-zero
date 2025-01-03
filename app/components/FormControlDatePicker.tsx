import {
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  Control,
} from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface FormControlDatePickerProps<TFormValues extends FieldValues> {
  /**
   * The field name
   */
  name: Path<TFormValues>;
  /**
   * The react-hook-form `control`
   */
  control: Control<TFormValues>;
  /**
   * Additional optional controller props
   */
  controllerProps?: Partial<ControllerProps>;
  /**
   * Optional invalid state while will cause the `is-invalid` css class
   * to be applied
   */
  isInvalid?: boolean;
}

/**
 * Date picker component for react-hook-form
 */
export default function FormControlDatePicker<
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
