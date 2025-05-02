import { Dropdown, Button } from "react-bootstrap";
import { FaEllipsisVertical } from "react-icons/fa6";
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
> = ({ record, additionalProps }) => {
  const isLinkingInProgress = !!additionalProps?.selectedEmsPcr;
  const isLinkingThisRecord =
    additionalProps?.selectedEmsPcr &&
    record.id === additionalProps?.selectedEmsPcr.id;

  const isRecordAlreadyLinked = !!record.person_id;

  if (isRecordAlreadyLinked) {
    return null;
  }

  return (
    <PermissionsRequired allowedRoles={allowedLinkRecordRoles}>
      <div className="d-flex">
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
              <span>Select person</span>
            </AlignedLabel>
          )}
          {isLinkingThisRecord && <span>Cancel</span>}
        </Button>
        <Dropdown className="ms-1">
          <Dropdown.Toggle variant="outline-primary" size="sm">
            <FaEllipsisVertical />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Set as unmatched</Dropdown.Item>
            <Dropdown.Item>Reset</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </PermissionsRequired>
  );
};

export default EMSLinkRecordButton;
