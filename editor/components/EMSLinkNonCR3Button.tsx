import Button from "react-bootstrap/Button";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";
import { RowActionComponentProps } from "@/components/RelatedRecordTable";
import { NonCR3Record } from "@/types/nonCr3";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkNonCR3ButtonProps extends Record<string, unknown> {
  onClick: (incidentNumber: string, newNonCR3CaseId: number) => void;
  incidentNumber: string;
  matchedNonCr3CaseId: number | null;
}

/** Button component for matching Non-CR3 record row to the incident */
const EMSLinkNonCR3Button: React.FC<
  RowActionComponentProps<NonCR3Record, EMSLinkNonCR3ButtonProps>
> = ({ record, additionalProps }) => {
  const nonCR3CaseId = record?.case_id;
  const isIncidentAlreadyMatched = !!additionalProps?.matchedNonCr3CaseId;

  if (isIncidentAlreadyMatched) {
    return null;
  }

  return (
    <PermissionsRequired allowedRoles={allowedLinkRecordRoles}>
      <Button
        size="sm"
        variant="primary"
        onClick={() => {
          if (!!additionalProps) {
            additionalProps.onClick(
              additionalProps.incidentNumber,
              nonCR3CaseId
            );
          }
        }}
      >
        <AlignedLabel>
          <span>Match to incident</span>
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
};

export default EMSLinkNonCR3Button;
