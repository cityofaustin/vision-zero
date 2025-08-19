import Button from "react-bootstrap/Button";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import AlignedLabel from "@/components/AlignedLabel";
import { AddressFormInputs } from "@/components/EditCrashAddressModal";

/**
 * Button on the crash address edit modal that swaps the inputs of the
 * primary and secondary address fields in the form
 */
export default function CrashSwapAddressButton({
  getValues,
  setValue,
}: {
  getValues: UseFormGetValues<AddressFormInputs>;
  setValue: UseFormSetValue<AddressFormInputs>;
}) {
  const handleSwapAddresses = () => {
    // Get the current values in the form state
    const currentValues = getValues();

    // Swap the primary and secondary values
    const swappedValues: AddressFormInputs = {
      rpt_block_num: currentValues.rpt_sec_block_num,
      rpt_street_pfx: currentValues.rpt_sec_street_pfx,
      rpt_street_name: currentValues.rpt_sec_street_name,
      rpt_street_sfx: currentValues.rpt_sec_street_sfx,
      rpt_street_desc: currentValues.rpt_sec_street_desc,
      rpt_road_part_id: currentValues.rpt_sec_road_part_id,
      rpt_rdwy_sys_id: currentValues.rpt_sec_rdwy_sys_id,
      rpt_hwy_num: currentValues.rpt_sec_hwy_num,
      rpt_hwy_sfx: currentValues.rpt_sec_hwy_sfx,

      rpt_sec_block_num: currentValues.rpt_block_num,
      rpt_sec_street_pfx: currentValues.rpt_street_pfx,
      rpt_sec_street_name: currentValues.rpt_street_name,
      rpt_sec_street_sfx: currentValues.rpt_street_sfx,
      rpt_sec_street_desc: currentValues.rpt_street_desc,
      rpt_sec_road_part_id: currentValues.rpt_road_part_id,
      rpt_sec_rdwy_sys_id: currentValues.rpt_rdwy_sys_id,
      rpt_sec_hwy_num: currentValues.rpt_hwy_num,
      rpt_sec_hwy_sfx: currentValues.rpt_hwy_sfx,
    };

    // Set the new swapped values in the form state
    Object.entries(swappedValues).forEach(([key, value]) => {
      // Setting shouldDirty on setValue allows us to enable the save button when addresses are swapped
      setValue(key as keyof AddressFormInputs, value, { shouldDirty: true });
    });
  };

  return (
    <div>
      <Button size="sm" variant="outline-primary" onClick={handleSwapAddresses}>
        <AlignedLabel>
          <FaArrowRightArrowLeft className="me-2" />
          <span>Swap addresses</span>
        </AlignedLabel>
      </Button>
    </div>
  );
}
