import { useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { LuCheck, LuCopy } from "react-icons/lu";

interface CopyValueButtonProps {
  /* The value to be copied */
  value: unknown;
  /* The label to display in the button tooltip on hover */
  tooltipLabel: string;
}

/**
 * Compent provides a button UI to copy an aribtrary value to the clipboard
 */
export default function CopyValueButton({
  value,
  tooltipLabel,
}: CopyValueButtonProps) {
  const [isCopyClicked, setIsCopyClicked] = useState(false);

  const handleCopyValue = () => {
    navigator.clipboard.writeText(String(value)).then(() => {
      setIsCopyClicked(true);
      const copiedStateTime = 1000;
      setTimeout(() => setIsCopyClicked(false), copiedStateTime);
    });
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="copy-address-tooltip" hidden={isCopyClicked}>
          {tooltipLabel}
        </Tooltip>
      }
    >
      <Button
        onClick={handleCopyValue}
        className="d-flex align-items-baseline edit-address-button mt-1 px-1"
      >
        {!isCopyClicked && <LuCopy className="text-muted" />}
        {isCopyClicked && <LuCheck className="text-success" />}
      </Button>
    </OverlayTrigger>
  );
}
