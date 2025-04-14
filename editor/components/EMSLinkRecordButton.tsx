import Button from "react-bootstrap/Button";
import { EMSPatientCareRecord } from "@/types/ems";
import { RowActionComponentProps } from "@/components/RelatedRecordTable";
import { FaLink } from "react-icons/fa6";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkRecordButtonProps extends Record<string, unknown> {
  onClick: (emsId: EMSPatientCareRecord) => void;
  selectedEmsPcr: EMSPatientCareRecord | null;
}

const EMSLinkRecordButton: React.FC<
  RowActionComponentProps<EMSPatientCareRecord, EMSLinkRecordButtonProps>
> = ({ record, mutation, onSaveCallback, additionalProps }) => {
  //   const { mutate, loading: isMutating } = useMutation(mutation);

  const isLinkingInProgress = !!additionalProps?.selectedEmsPcr;
  const isLinkingThisRecord =
    additionalProps?.selectedEmsPcr &&
    record.id === additionalProps?.selectedEmsPcr.id;

  //   if (isLinkingInProgress && !isLinkingThisRecord) {
  //     return null;
  //   }

  return (
    <PermissionsRequired allowedRoles={allowedLinkRecordRoles}>
      <Button
        size="sm"
        variant={isLinkingThisRecord ? "secondary" : "primary"}
        disabled={isLinkingInProgress && !isLinkingThisRecord}
        onClick={() => {
          additionalProps?.onClick(record);
        }}
      >
        {!isLinkingThisRecord && (
          <AlignedLabel>
            <FaLink className="me-2" />
            <span>Link</span>
          </AlignedLabel>
        )}
        {isLinkingThisRecord && <span>Cancel</span>}
      </Button>
    </PermissionsRequired>
  );
};

export default EMSLinkRecordButton;
