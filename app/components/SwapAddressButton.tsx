import Button from "react-bootstrap/Button";
import { useMutation } from "@/utils/graphql";
import AlignedLabel from "./AlignedLabel";
import { FaArrowRightArrowLeft } from "react-icons/fa6";

interface SwapAddressButtonProps<T extends Record<string, unknown>> {
  record: T;
  mutation: string;
  onSaveCallback: () => Promise<void>;
}

/**
 * Button on the primary address data card that allows users to swap
 * the primary and secondary addresses of a crash
 */
export default function SwapAddressButton<T extends Record<string, unknown>>({
  record,
  mutation,
  onSaveCallback,
}: SwapAddressButtonProps<T>) {
  // switching all primary and secondary address values here
  const mutationVariables = {
    rpt_block_num: record.rpt_sec_block_num,
    rpt_street_name: record.rpt_sec_street_name,
    rpt_street_desc: record.rpt_sec_street_desc,
    rpt_road_part_id: record.rpt_sec_road_part_id,
    rpt_rdwy_sys_id: record.rpt_sec_rdwy_sys_id,
    rpt_hwy_num: record.rpt_sec_hwy_num,
    rpt_street_pfx: record.rpt_sec_street_pfx,
    rpt_street_sfx: record.rpt_sec_street_sfx,
    rpt_sec_block_num: record.rpt_block_num,
    rpt_sec_street_name: record.rpt_street_name,
    rpt_sec_street_desc: record.rpt_street_desc,
    rpt_sec_road_part_id: record.rpt_road_part_id,
    rpt_sec_rdwy_sys_id: record.rpt_rdwy_sys_id,
    rpt_sec_hwy_num: record.rpt_hwy_num,
    rpt_sec_street_pfx: record.rpt_street_pfx,
    rpt_sec_street_sfx: record.rpt_street_sfx,
  };

  const { mutate, loading: isMutating } = useMutation(mutation);

  return (
    <div>
      <Button
        size="sm"
        variant="primary"
        disabled={isMutating}
        onClick={async () => {
          if (
            window.confirm(
              "Are you sure you want to swap the primary and secondary address?"
            )
          ) {
            await mutate({
              id: record.id,
              updates: { ...mutationVariables },
            });
            await onSaveCallback();
          }
        }}
      >
        <AlignedLabel>
          <FaArrowRightArrowLeft className="me-2" />
          <span>Swap addresses</span>
        </AlignedLabel>
      </Button>
    </div>
  );
}
