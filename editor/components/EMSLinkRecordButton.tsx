import { Dropdown, Button } from "react-bootstrap";
import { FaEllipsisVertical } from "react-icons/fa6";
import { EMSPatientCareRecord } from "@/types/ems";
import { RowActionComponentProps } from "@/components/RelatedRecordTable";
import { FaLink } from "react-icons/fa6";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";
import { useMutation } from "@/utils/graphql";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkRecordButtonProps extends Record<string, unknown> {
  onClick: (emsId: EMSPatientCareRecord) => void;
  selectedEmsPcr: EMSPatientCareRecord | null;
}

const EMSLinkRecordButton: React.FC<
  RowActionComponentProps<EMSPatientCareRecord, EMSLinkRecordButtonProps>
> = ({ record, additionalProps, mutation, onSaveCallback }) => {
  const isLinkingInProgress = !!additionalProps?.selectedEmsPcr;
  const isLinkingThisRecord =
    additionalProps?.selectedEmsPcr &&
    record.id === additionalProps?.selectedEmsPcr.id;

  const { mutate: setRecordManualUnmatched } = useMutation(mutation);

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
          <Dropdown.Menu renderOnMount popperConfig={{ strategy: "fixed" }}>
            <Dropdown.Item
              onClick={async () => {
                await setRecordManualUnmatched({
                  id: record.id,
                  updates: {
                    crash_match_status: "unmatched_by_manual_qa",
                    crash_pk: null,
                    person_id: null,
                    matched_crash_pks: null,
                  },
                });
                await onSaveCallback();
              }}
            >
              Match not found
            </Dropdown.Item>
            <Dropdown.Item>Reset</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </PermissionsRequired>
  );
};

export default EMSLinkRecordButton;
