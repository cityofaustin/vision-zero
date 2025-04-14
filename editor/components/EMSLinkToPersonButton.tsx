import Button from "react-bootstrap/Button";
import { EMSPatientCareRecord } from "@/types/ems";
import { RowActionComponentProps } from "@/components/RelatedRecordTable";
import { PeopleListRow } from "@/types/peopleList";
import { FaLink } from "react-icons/fa6";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkToPersonButtonProps extends Record<string, unknown> {
  onClick: (emsId: number, personId: number, crashPk: number) => void;
  selectedEmsPcr: EMSPatientCareRecord | null;
}

const EMSLinkToPersonButton: React.FC<
  RowActionComponentProps<PeopleListRow, EMSLinkToPersonButtonProps>
> = ({ record, additionalProps }) => {
  const isLinkingInProgress = !!additionalProps?.selectedEmsPcr;

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
              record.id,
              record.crash_pk
            );
          }
        }}
      >
        <AlignedLabel>
          <FaLink className="me-2" />
          <span>Select</span>
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
};

export default EMSLinkToPersonButton;
