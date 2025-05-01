import Button from "react-bootstrap/Button";
import { EMSPatientCareRecord } from "@/types/ems";
import { RowActionComponentProps } from "@/components/RelatedRecordTable";
import { PeopleListRow } from "@/types/peopleList";
import { FaLink } from "react-icons/fa6";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkToPersonButtonProps extends Record<string, unknown> {
  onClick: (emsId: number, personId: number) => void;
  selectedEmsPcr: EMSPatientCareRecord | null;
}

const EMSLinkToPersonButton: React.FC<
  RowActionComponentProps<PeopleListRow, EMSLinkToPersonButtonProps>
> = ({ record, additionalProps }) => {
  const isLinkingInProgress = !!additionalProps?.selectedEmsPcr;
  // Does the person already have a non-null ems_pcr relationship
  const isPersonAlreadyLinked = !!record.ems_pcr;

  if (!isLinkingInProgress || isPersonAlreadyLinked) {
    return null;
  }

  return (
    <PermissionsRequired allowedRoles={allowedLinkRecordRoles}>
      <Button
        size="sm"
        variant="primary"
        disabled={!isLinkingInProgress}
        onClick={() => {
          if (additionalProps?.selectedEmsPcr) {
            additionalProps?.onClick(
              additionalProps.selectedEmsPcr.id,
              record.id
            );
          }
        }}
      >
        <AlignedLabel>
          <FaLink className="me-2" />
          <span>Select match</span>
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
};

export default EMSLinkToPersonButton;
