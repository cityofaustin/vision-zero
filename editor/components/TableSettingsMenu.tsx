import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { FaGear } from "react-icons/fa6";
import { ColumnVisibilitySetting } from "@/types/types";
import { ColDataCardDef } from "@/types/types";

interface TableSettingsMenuProps {
  /**
   *  Array of columns and their visibility settings
   */
  columnVisibilitySettings: ColumnVisibilitySetting[];
  /**
   * Sets the column visibility settings
   */
  setColumnVisibilitySettings: Dispatch<
    SetStateAction<ColumnVisibilitySetting[]>
  >;
  /**
   * Has the local storage item for column visibility been loaded
   */
  isColVisibilityLocalStorageLoaded: boolean;
  /**
   * Set whether the column visibility local storage item has loaded
   */
  setIsColVisibilityLocalStorageLoaded: Dispatch<SetStateAction<boolean>>;
  /**
   * The key to use when saving and loading table data to local storage
   */
  localStorageKey: string;
}

/**
 * Construct the table's visible columns
 */
export const useVisibleColumns = <T extends Record<string, unknown>>(
  columns: ColDataCardDef<T>[],
  columnVisibilitySettings: ColumnVisibilitySetting[]
) =>
  useMemo(
    () =>
      columns.filter((col) => {
        const colFromVisibilitySettings = columnVisibilitySettings.find(
          (visibleColumn) => visibleColumn.path === col.path
        );
        /**
         * if a matching column is found in the visibility settings, use it
         * otherwise the column is visible unless it's exportOnly or defaultHidden
         */
        return colFromVisibilitySettings
          ? colFromVisibilitySettings.isVisible
          : !col.exportOnly && !col.defaultHidden;
      }),
    [columns, columnVisibilitySettings]
  );

/**
 * Table component that controls column visibility
 */
export default function TableSettingsMenu({
  columnVisibilitySettings,
  setColumnVisibilitySettings,
  isColVisibilityLocalStorageLoaded,
  setIsColVisibilityLocalStorageLoaded,
  localStorageKey,
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
      const willAllColumnsBeInvisible = updatedColVisibilitySettings.every(
        (col) => col.isVisible === false
      );
      if (!willAllColumnsBeInvisible) {
        setColumnVisibilitySettings(updatedColVisibilitySettings);
      }
    },
    [setColumnVisibilitySettings]
  );

  /**
   * Load column visibility settings from localstorage
   */
  useEffect(() => {
    if (isColVisibilityLocalStorageLoaded) {
      return;
    }

    /**
     * Try to load column visibility
     */
    const columnLocalStorageKey = localStorageKey + "_columnVisibility";
    const columnVisibilityFromStorageString =
      localStorage.getItem(columnLocalStorageKey) || "";
    let columnVisibilityFromStorage: ColumnVisibilitySetting[] | undefined;

    try {
      columnVisibilityFromStorage = JSON.parse(
        columnVisibilityFromStorageString
      );
    } catch {
      console.error(
        "Unable to parse column visibility from local storage. Using default visibility instead"
      );
      setIsColVisibilityLocalStorageLoaded(true);
      return;
    }

    if (columnVisibilityFromStorage) {
      /**
       * Update the default visibility from what was found in local storage. This
       * ensures that stale col visibility data from storage is brought into sync
       * with the current version of the table config
       */
      const updatedColVisibilitySettings = columnVisibilitySettings.map(
        (col) => {
          const savedCol = columnVisibilityFromStorage.find(
            (savedCol) => savedCol.path === col.path
          );
          if (savedCol) {
            // use visibility from saved column
            return { ...col, isVisible: savedCol.isVisible };
          } else {
            return { ...col };
          }
        }
      );
      setColumnVisibilitySettings(updatedColVisibilitySettings);
      setIsColVisibilityLocalStorageLoaded(true);
    }
  }, [
    localStorageKey,
    columnVisibilitySettings,
    setColumnVisibilitySettings,
    isColVisibilityLocalStorageLoaded,
    setIsColVisibilityLocalStorageLoaded,
  ]);

  /**
   * Keep changes to col visibility in sync with localstorage
   */
  useEffect(() => {
    if (isColVisibilityLocalStorageLoaded) {
      const columnVisLocalStorageKey = localStorageKey + "_columnVisibility";
      localStorage.setItem(
        columnVisLocalStorageKey,
        JSON.stringify(columnVisibilitySettings)
      );
    }
  }, [
    isColVisibilityLocalStorageLoaded,
    localStorageKey,
    columnVisibilitySettings,
  ]);

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
        {columnVisibilitySettings.map((col) => {
          return (
            <Dropdown.Item
              className="d-flex align-items-center"
              key={col.path}
              onClick={(e) => {
                handleUpdateColVisibility(columnVisibilitySettings, col.path);
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
