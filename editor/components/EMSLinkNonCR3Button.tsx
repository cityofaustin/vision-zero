import Button from "react-bootstrap/Button";
import PermissionsRequired from "@/components/PermissionsRequired";
import AlignedLabel from "@/components/AlignedLabel";

const allowedLinkRecordRoles = ["vz-admin", "editor"];

export interface EMSLinkNonCR3ButtonProps extends Record<string, unknown> {
  onClick: (incidentNumber: string, nonCR3CaseId: number) => void;
  incidentNumber: string | null;
}

const EMSLinkNonCR3Button = ({ record, additionalProps }) => {
  const nonCR3CaseId = record?.case_id;

  return (
    <PermissionsRequired allowedRoles={allowedLinkRecordRoles}>
      <Button
        size="sm"
        variant="primary"
        // disabled={!isLinkingInProgress}
        // onClick={() => {
        //   if (additionalProps?.selectedEmsPcr) {
        //     additionalProps?.onClick(
        //       additionalProps.selectedEmsPcr.id,
        //       record.id
        //     );
        //   }
        // }}
        onClick={() => {
          additionalProps?.onClick(
            additionalProps.incidentNumber,
            nonCR3CaseId
          );
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
