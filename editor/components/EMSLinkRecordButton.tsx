import { Dropdown, Button } from "react-bootstrap";
import { FaEllipsisVertical } from "react-icons/fa6";
import { EMSPatientCareRecord } from "@/types/ems";
import { RowActionComponentProps } from "@/components/RelatedRecordTable";
import { FaLink } from "react-icons/fa6";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";
import { useMutation } from "@/utils/graphql";
import { useMemo } from "react";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkRecordButtonProps extends Record<string, unknown> {
  onClick: (emsId: EMSPatientCareRecord) => void;
  selectedEmsPcr: EMSPatientCareRecord | null;
}

const EMSLinkRecordButton: React.FC<
  RowActionComponentProps<EMSPatientCareRecord, EMSLinkRecordButtonProps>
> = ({
  record,
  additionalProps,
  mutation,
  onSaveCallback,
  isEditingColumn,
}) => {
  const isLinkingAnyRecord = !!additionalProps?.selectedEmsPcr;
  const isLinkingThisRecord =
    additionalProps?.selectedEmsPcr &&
    record.id === additionalProps?.selectedEmsPcr.id;

  /**
   * Hook that gets the variables to be used in the reset button mutation
   */
  const resetButtonUpdates = useMemo(() => {
    let updates = {};
    if (record.matched_crash_pks === null) {
      updates = {
        crash_pk: null,
        person_id: null,
        crash_match_status: "unmatched",
        person_match_status: "unmatched"
      };
    } else if (record.matched_crash_pks.length === 1) {
      updates = {
        crash_pk: record.matched_crash_pks[0],
        person_id: null,
        crash_match_status: "matched_by_automation",
      };
    } else if (record.matched_crash_pks.length > 1) {
      updates = {
        crash_pk: null,
        person_id: null,
        crash_match_status: "multiple_matches_by_automation",
      };
    }
    return updates;
  }, [record]);

  const { mutate: updateEMSRecord } = useMutation(mutation);

  return (
    <PermissionsRequired allowedRoles={allowedLinkRecordRoles}>
      <div className="d-flex">
        {!isEditingColumn && (
          <Button
            size="sm"
            variant={isLinkingThisRecord ? "secondary" : "primary"}
            disabled={isLinkingAnyRecord && !isLinkingThisRecord}
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
        )}
        {!isLinkingThisRecord && !isEditingColumn && (
          <Dropdown className="ms-1">
            <Dropdown.Toggle
              className="hide-toggle"
              variant="outline-primary"
              size="sm"
            >
              <FaEllipsisVertical />
            </Dropdown.Toggle>
            <Dropdown.Menu renderOnMount popperConfig={{ strategy: "fixed" }}>
              <Dropdown.Item
                onClick={async () => {
                  await updateEMSRecord({
                    id: record.id,
                    updates: {
                      crash_match_status: "unmatched_by_manual_qa",
                      crash_pk: null,
                      person_id: null,
                    },
                  });
                  await onSaveCallback();
                }}
              >
                Match not found
              </Dropdown.Item>
              <Dropdown.Item
                onClick={async () => {
                  await updateEMSRecord({
                    id: record.id,
                    updates: resetButtonUpdates,
                  });
                  await onSaveCallback();
                }}
              >
                Reset
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </PermissionsRequired>
  );
};

export default EMSLinkRecordButton;
