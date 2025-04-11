import { Dispatch, SetStateAction, useCallback } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { ColumnVisibilitySetting } from "@/types/types";
import { FaGear } from "react-icons/fa6";

interface TableSettingsMenuProps {
  columnVisbilitySettings: ColumnVisibilitySetting[];
  setColumnVisbilitySettings: Dispatch<
    SetStateAction<ColumnVisibilitySetting[]>
  >;
}

/**
 * Table component that controls column visibility
 */
export default function TableSettingsMenu({
  columnVisbilitySettings,
  setColumnVisbilitySettings,
}: TableSettingsMenuProps) {
  const handleUpdateColVisibility = useCallback(
    (columns: ColumnVisibilitySetting[], path: string) => {
      const updatedColVisibilitySettings = columns.map((col) => {
        if (col.path !== path) {
          return col;
        }
        return { ...col, isVisible: !col.isVisible };
      });
      // do nothing if this will result in all columns being invisible
      const willAllColumnsBeInivisible = updatedColVisibilitySettings.every(
        (col) => col.isVisible === false
      );
      if (!willAllColumnsBeInivisible) {
        setColumnVisbilitySettings(updatedColVisibilitySettings);
      }
    },
    [setColumnVisbilitySettings]
  );

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-primary"
        className="border-0 hide-toggle"
        id="column-visibility-picker"
      >
        <FaGear />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ maxHeight: "50vh", overflowY: "auto" }}>
        {columnVisbilitySettings.map((col) => {
          return (
            <Dropdown.Item
              className="d-flex align-items-center"
              key={col.path}
              onClick={(e) => {
                handleUpdateColVisibility(columnVisbilitySettings, col.path);
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Form.Check
                style={{ pointerEvents: "none" }}
                type="switch"
                label={col.label}
                checked={col.isVisible}
                className="my-auto"
                readOnly
              />
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
